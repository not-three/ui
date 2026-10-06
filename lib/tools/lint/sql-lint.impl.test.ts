import { expect, test } from 'vitest';
import { run } from './sql-lint.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test.each(['sqlite', 'postgresql'])('accepts valid %s SQL', async dialect => {
  expect(await run({ input: textInput('SELECT 1;') }, { dialect }, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test('accepts PostgreSQL DDL syntax without executing it', async () => {
  expect(await run({ input: textInput('CREATE TABLE items (id integer PRIMARY KEY);') }, { dialect: 'postgresql' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test.each(['sqlite', 'postgresql'])('accepts a valid %s script without executing or resolving tables', async dialect => {
  expect(await run({ input: textInput('SELECT * FROM missing; INSERT INTO missing VALUES (1);') }, { dialect }, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test('accepts SQLite DDL followed by a query without executing it', async () => {
  expect(await run({ input: textInput('CREATE TABLE items(id integer); SELECT * FROM items;') }, { dialect: 'sqlite' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test('accepts multiple PostgreSQL statements', async () => {
  expect(await run({ input: textInput('SELECT 1; SELECT 2;') }, { dialect: 'postgresql' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test.each(['sqlite', 'postgresql'])('rejects malformed %s SQL', async dialect => {
  expect(await run({ input: textInput('SELECT FROM;') }, { dialect }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
test('reports SQLite parser position', async () => {
  expect(await run({ input: textInput('SELECT FROM;') }, { dialect: 'sqlite' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 1, column: 8 } }] });
});
test.each([['sqlite', 8], ['postgresql', 12]] as const)('preserves leading whitespace in %s error positions', async (dialect, column) => {
  expect(await run({ input: textInput('\nSELECT FROM;') }, { dialect }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 2, column } }] });
});
test.each([
  ['line comment', '-- FROM\nSELECT FROM;', 2, 8],
  ['block comment', '/* FROM */\nSELECT FROM;', 2, 8],
  ['string literal', "SELECT 'FROM', FROM;", 1, 16],
  ['quoted identifier', 'SELECT "FROM", FROM;', 1, 16],
  ['earlier statement', 'SELECT "FROM" AS label;\nSELECT FROM;', 2, 8],
  ['comment before a later statement', 'SELECT 1; -- FROM\nSELECT FROM;', 2, 8],
  ['multiline statement', "SELECT 'FROM',\nFROM;", 2, 1],
] as const)('locates a SQLite syntax token after %s', async (_case, source, line, column) => {
  expect(await run({ input: textInput(source) }, { dialect: 'sqlite' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line, column } }] });
});
test.each([
  ['invalid first token', 'SELECT FROM, FROM;'],
  ['invalid second token', 'SELECT 1 FROM FROM;'],
] as const)('omits an ambiguous SQLite position for %s', async (_case, source) => {
  const result = await run({ input: textInput(source) }, { dialect: 'sqlite' }, context);
  expect(result).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
  if (result.kind !== 'report') throw new Error('Expected a SQL report');
  expect(result.items[0]).not.toHaveProperty('position');
});
test('checks every SQLite statement without executing them', async () => {
  expect(await run({ input: textInput('SELECT 1; SELECT FROM;') }, { dialect: 'sqlite' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
test('rejects multiple PostgreSQL statements', async () => {
  expect(await run({ input: textInput('SELECT 1; SELECT FROM;') }, { dialect: 'postgresql' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
test('keeps semicolons inside SQL strings and comments within their statement', async () => {
  expect(await run({ input: textInput("SELECT ';'; -- a comment;\nSELECT 2;") }, { dialect: 'postgresql' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
