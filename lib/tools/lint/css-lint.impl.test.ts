import { expect, test } from 'vitest';
import { run } from './css-lint.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('accepts structural CSS', async () => {
  expect(await run({ input: textInput('a { color: red; }') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test('reports CSS parse errors', async () => {
  expect(await run({ input: textInput('a { color: red;') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
