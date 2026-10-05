declare module 'sql.js/dist/sql-asm.js' {
  const initSqlJs: () => Promise<{ Database: new () => { iterateStatements(sql: string): Iterable<unknown>; close(): void } }>;
  export default initSqlJs;
}
