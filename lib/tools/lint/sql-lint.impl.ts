import type { ToolRun } from '../types';
import { invalid, sourceText, valid } from './shared';

export const run: ToolRun = async (inputs, options) => {
  const source = sourceText(inputs).trim();
  if (!source) return invalid('SQL is empty');
  const dialect = options.dialect || 'sqlite';
  if (dialect !== 'sqlite' && dialect !== 'postgresql') return invalid('Unknown SQL dialect');
  if (dialect === 'postgresql') {
    const { PGlite } = await import('@electric-sql/pglite');
    const db = new PGlite();
    try {
      await db.query(`EXPLAIN ${source}`);
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
  try {
    let count = 0;
    for (const _statement of db.iterateStatements(source)) count++;
    if (count === 0) return invalid('SQL is empty');
    return valid('Valid SQLite syntax');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const token = /near "([^"]+)"/.exec(message)?.[1];
    const at = token ? source.indexOf(token) : -1;
    const prefix = at < 0 ? null : source.slice(0, at).split('\n');
    return invalid(message, prefix?.length, prefix ? prefix.at(-1)!.length + 1 : undefined);
  } finally {
    db.close();
  }
};
