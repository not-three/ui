import type { ToolRun } from '../types';
import { invalid, sourceText, valid } from './shared';
import postgresWasmUrl from '../../../node_modules/@electric-sql/pglite/dist/postgres.wasm?url';
import postgresDataUrl from '../../../node_modules/@electric-sql/pglite/dist/postgres.data?url';

type Statement = { text: string; start: number };

function splitStatements(source: string): Statement[] {
  const statements: Statement[] = [];
  let start = 0;
  let hasCode = false;
  for (let i = 0; i < source.length; i++) {
    const character = source[i];
    if (character === '-' && source[i + 1] === '-') {
      i = source.indexOf('\n', i + 2);
      if (i < 0) break;
      continue;
    }
    if (character === '/' && source[i + 1] === '*') {
      let depth = 1;
      i += 2;
      while (i < source.length && depth) {
        if (source.slice(i, i + 2) === '/*') { depth++; i += 2; }
        else if (source.slice(i, i + 2) === '*/') { depth--; i += 2; }
        else i++;
      }
      i--;
      continue;
    }
    const dollar = character === '$' ? /^\$([A-Za-z_][A-Za-z_0-9]*)?\$/.exec(source.slice(i))?.[0] : undefined;
    if (dollar) {
      hasCode = true;
      const end = source.indexOf(dollar, i + dollar.length);
      i = end < 0 ? source.length : end + dollar.length - 1;
      continue;
    }
    if (character === '\'' || character === '"' || character === '`' || character === '[') {
      hasCode = true;
      const closing = character === '[' ? ']' : character;
      while (++i < source.length) {
        if (source[i] === closing) {
          if (source[i + 1] === closing) { i++; continue; }
          break;
        }
      }
      continue;
    }
    if (character === ';') {
      if (hasCode) statements.push({ text: source.slice(start, i + 1), start });
      start = i + 1;
      hasCode = false;
      continue;
    }
    if (!/\s/.test(character)) hasCode = true;
  }
  if (hasCode) statements.push({ text: source.slice(start), start });
  return statements;
}

function findCodeToken(source: string, statement: Statement, token: string): number {
  const end = statement.start + statement.text.length;
  const word = /^[A-Za-z_0-9]+$/.test(token);
  for (let i = statement.start; i < end; i++) {
    const character = source[i];
    if (character === '-' && source[i + 1] === '-') {
      const newline = source.indexOf('\n', i + 2);
      if (newline < 0 || newline >= end) break;
      i = newline;
      continue;
    }
    if (character === '/' && source[i + 1] === '*') {
      let depth = 1;
      i += 2;
      while (i < end && depth) {
        if (source.slice(i, i + 2) === '/*') { depth++; i += 2; }
        else if (source.slice(i, i + 2) === '*/') { depth--; i += 2; }
        else i++;
      }
      i--;
      continue;
    }
    const dollar = character === '$' ? /^\$([A-Za-z_][A-Za-z_0-9]*)?\$/.exec(source.slice(i))?.[0] : undefined;
    if (dollar) {
      const closing = source.indexOf(dollar, i + dollar.length);
      i = closing < 0 || closing >= end ? end : closing + dollar.length - 1;
      continue;
    }
    if (character === '\'' || character === '"' || character === '`' || character === '[') {
      const closing = character === '[' ? ']' : character;
      while (++i < end) {
        if (source[i] === closing) {
          if (source[i + 1] === closing) { i++; continue; }
          break;
        }
      }
      continue;
    }
    if (source.startsWith(token, i) && i + token.length <= end && (!word || (
      !/[A-Za-z_0-9]/.test(source[i - 1] ?? '') && !/[A-Za-z_0-9]/.test(source[i + token.length] ?? '')
    ))) return i;
  }
  return -1;
}

function positionAt(source: string, offset: number): { line: number; column: number } {
  const prefix = source.slice(0, offset).split('\n');
  return { line: prefix.length, column: prefix.at(-1)!.length + 1 };
}

export const run: ToolRun = async (inputs, options) => {
  const source = sourceText(inputs);
  const statements = splitStatements(source);
  if (!statements.length) return invalid('SQL is empty');
  const dialect = options.dialect || 'sqlite';
  if (dialect !== 'sqlite' && dialect !== 'postgresql') return invalid('Unknown SQL dialect');
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
        const at = token ? findCodeToken(source, statement, token) : -1;
        const position = at < 0 ? undefined : positionAt(source, at);
        return invalid(message, position?.line, position?.column);
      }
    }
    return valid('Valid SQLite syntax');
  } finally {
    db.close();
  }
};
