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
test.each(['sqlite', 'postgresql'])('rejects malformed %s SQL', async dialect => {
  expect(await run({ input: textInput('SELECT FROM;') }, { dialect }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
test('reports SQLite parser position', async () => {
  expect(await run({ input: textInput('SELECT FROM;') }, { dialect: 'sqlite' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 1, column: 8 } }] });
});
test('positions an error in a later SQLite statement', async () => {
  expect(await run({ input: textInput('SELECT "FROM" AS label;\nSELECT FROM;') }, { dialect: 'sqlite' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 2, column: 8 } }] });
});
test('checks every SQLite statement without executing them', async () => {
  expect(await run({ input: textInput('SELECT 1; SELECT FROM;') }, { dialect: 'sqlite' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
test('rejects multiple PostgreSQL statements', async () => {
  expect(await run({ input: textInput('SELECT 1; SELECT FROM;') }, { dialect: 'postgresql' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
