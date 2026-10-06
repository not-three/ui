import { expect, test } from 'vitest';
import { run } from './js-ts-lint.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('accepts valid JavaScript', async () => {
  expect(await run({ input: textInput('const answer = 42;', 'javascript') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test('reports JavaScript syntax positions', async () => {
  expect(await run({ input: textInput('const x = ;', 'javascript') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 1, column: 11 } }] });
});
test('reports TypeScript single file type errors', async () => {
  const result = await run({ input: textInput('const x: number = "bad";', 'typescript') }, {}, context);
  expect(result).toMatchObject({ kind: 'report', items: [expect.objectContaining({ level: 'error', position: expect.objectContaining({ line: 1, column: 7 }) })] });
});
