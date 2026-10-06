declare module 'sql.js/dist/sql-asm.js' {
  const initSqlJs: () => Promise<{ Database: new () => { iterateStatements(sql: string): Iterable<unknown> & { getRemainingSQL(): string }; close(): void } }>;
  export default initSqlJs;
}
