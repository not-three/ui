import type { ToolRun } from '../types';
import { invalid, sourceText, valid } from './shared';
import postgresWasmUrl from '../../../node_modules/@electric-sql/pglite/dist/postgres.wasm?url';
import postgresDataUrl from '../../../node_modules/@electric-sql/pglite/dist/postgres.data?url';

type Statement = { text: string; start: number };

function lexSql(source: string, dialect: 'sqlite' | 'postgresql'): { statements: Statement[]; code: Uint8Array } {
  const statements: Statement[] = [];
  const code = new Uint8Array(source.length);
  let start = 0;
  let hasCode = false;
  let unterminated = false;
  for (let i = 0; i < source.length;) {
    const character = source[i];
    if (character === '-' && source[i + 1] === '-') {
      const newline = source.indexOf('\n', i + 2);
      i = newline < 0 ? source.length : newline + 1;
      continue;
    }
    if (character === '/' && source[i + 1] === '*') {
      let depth = 1;
      i += 2;
      while (i < source.length && depth) {
        if (dialect === 'postgresql' && source.slice(i, i + 2) === '/*') { depth++; i += 2; }
        else if (source.slice(i, i + 2) === '*/') { depth--; i += 2; }
        else i++;
      }
      if (depth) unterminated = true;
      continue;
    }
    const dollar = dialect === 'postgresql' && character === '$' && !/[A-Za-z_0-9$]/.test(source[i - 1] ?? '')
      ? /^\$([A-Za-z_][A-Za-z_0-9]*)?\$/.exec(source.slice(i))?.[0] : undefined;
    if (dollar) {
      hasCode = true;
      const closing = source.indexOf(dollar, i + dollar.length);
      if (closing < 0) unterminated = true;
      i = closing < 0 ? source.length : closing + dollar.length;
      continue;
    }
    if (character === '\'' || character === '"' || (dialect === 'sqlite' && (character === '`' || character === '['))) {
      hasCode = true;
      const closing = character === '[' ? ']' : character;
      const escaped = dialect === 'postgresql' && character === '\'' && (
        (/[eE]/.test(source[i - 1] ?? '') && !/[A-Za-z_0-9]/.test(source[i - 2] ?? '')) ||
        (source.slice(i - 2, i).toUpperCase() === 'U&' && !/[A-Za-z_0-9]/.test(source[i - 3] ?? ''))
      );
      i++;
      let closed = false;
      while (i < source.length) {
        if (escaped && source[i] === '\\') { i += 2; continue; }
        if (source[i] === closing) {
          if (source[i + 1] === closing) { i += 2; continue; }
          i++;
          closed = true;
          break;
        }
        i++;
      }
      if (!closed) unterminated = true;
      continue;
    }
    code[i] = 1;
    if (character === ';') {
      if (hasCode) statements.push({ text: source.slice(start, i + 1), start });
      start = i + 1;
      hasCode = false;
      i++;
      continue;
    }
    if (!/\s/.test(character)) hasCode = true;
    i++;
  }
  if (hasCode || unterminated) statements.push({ text: source.slice(start), start });
  return { statements, code };
}

function findCodeToken(source: string, code: Uint8Array, statement: Statement, token: string): number {
  const end = statement.start + statement.text.length;
  const word = /^[A-Za-z_0-9]+$/.test(token);
  let match = -1;
  for (let i = statement.start; i + token.length <= end; i++) {
    if (source.startsWith(token, i) && i + token.length <= end && (!word || (
      !/[A-Za-z_0-9]/.test(source[i - 1] ?? '') && !/[A-Za-z_0-9]/.test(source[i + token.length] ?? '')
    ))) {
      if (!code.subarray(i, i + token.length).every(value => value === 1)) continue;
      // sql.js gives token text without an offset; repeated code tokens are ambiguous.
      if (match >= 0) return -1;
      match = i;
    }
  }
  return match;
}

function positionAt(source: string, offset: number): { line: number; column: number } {
  const prefix = source.slice(0, offset).split('\n');
  return { line: prefix.length, column: prefix.at(-1)!.length + 1 };
}

export const run: ToolRun = async (inputs, options) => {
  const source = sourceText(inputs);
  const dialect = options.dialect || 'sqlite';
  if (dialect !== 'sqlite' && dialect !== 'postgresql') return invalid('Unknown SQL dialect');
  const { statements, code } = lexSql(source, dialect);
  if (!statements.length) return invalid('SQL is empty');
  if (dialect === 'postgresql') {
    const { PGlite, protocol } = await import('@electric-sql/pglite');
    const assets = import.meta.env.MODE === 'test' ? undefined : {
      wasmModule: await WebAssembly.compile(await (await fetch(postgresWasmUrl)).arrayBuffer()),
      fsBundle: await (await fetch(postgresDataUrl)).blob(),
    };
    const db = new PGlite(assets);
    try {
      await db.waitReady;
      for (const statement of statements) {
        try {
          const result = await db.execProtocol(protocol.serialize.parse({ text: statement.text }));
          if (!result.messages.some(message => message.name === 'parseComplete')) return invalid('Invalid PostgreSQL syntax');
        } catch (error) {
          const e = error as Error & { code?: string; position?: string };
          await db.execProtocol(protocol.serialize.sync());
          if (['42P01', '42703', '42883', '42P07', '42701', '42702'].includes(e.code ?? '')) continue;
          const offset = Number(e.position);
          const position = Number.isFinite(offset) && offset > 0 ? positionAt(source, statement.start + offset - 1) : undefined;
          return invalid(e.message, position?.line, position?.column);
        }
      }
      return valid('Valid PostgreSQL syntax');
    } finally {
      await db.close();
    }
  }
  const initSqlJs = (await import('sql.js/dist/sql-asm.js')).default;
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  try {
    for (const statement of statements) {
      const iterator = db.iterateStatements(statement.text);
      try {
        for (const _prepared of iterator) { /* Parse without executing. */ }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/^(?:no such (?:table|column|index|function|collation sequence)|table .* already exists|index .* already exists|unknown database|ambiguous column name|misuse of aggregate)/i.test(message)) continue;
        const token = /near "([^"]+)"/.exec(message)?.[1];
        const at = token ? findCodeToken(source, code, statement, token) : -1;
        const position = at < 0 ? undefined : positionAt(source, at);
        return invalid(message, position?.line, position?.column);
      }
    }
    return valid('Valid SQLite syntax');
  } finally {
    db.close();
  }
};
