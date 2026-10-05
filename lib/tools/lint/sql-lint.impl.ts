import type { ToolRun } from '../types';
import { invalid, sourceText, valid } from './shared';
import postgresWasmUrl from '../../../node_modules/@electric-sql/pglite/dist/postgres.wasm?url';
import postgresDataUrl from '../../../node_modules/@electric-sql/pglite/dist/postgres.data?url';

export const run: ToolRun = async (inputs, options) => {
  const source = sourceText(inputs).trim();
  if (!source) return invalid('SQL is empty');
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
      const result = await db.execProtocol(protocol.serialize.parse({ text: source }));
      if (!result.messages.some(message => message.name === 'parseComplete')) return invalid('Expected one valid PostgreSQL statement');
      return valid('Valid PostgreSQL syntax');
    } catch (error) {
      const e = error as Error & { position?: string };
      const offset = Number(e.position);
      const prefix = Number.isFinite(offset) && offset > 0 ? source.slice(0, offset - 1).split('\n') : null;
      return invalid(e.message, prefix?.length, prefix ? prefix.at(-1)!.length + 1 : undefined);
    } finally {
      await db.close();
    }
  }
  const initSqlJs = (await import('sql.js/dist/sql-asm.js')).default;
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  const statements = db.iterateStatements(source);
  try {
    let count = 0;
    for (const _statement of statements) count++;
    if (count === 0) return invalid('SQL is empty');
    return valid('Valid SQLite syntax');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const token = /near "([^"]+)"/.exec(message)?.[1];
    const statementStart = source.length - statements.getRemainingSQL().length;
    const at = token ? source.indexOf(token, statementStart) : -1;
    const prefix = at < 0 ? null : source.slice(0, at).split('\n');
    return invalid(message, prefix?.length, prefix ? prefix.at(-1)!.length + 1 : undefined);
  } finally {
    db.close();
  }
};
