import { expect, test } from 'vitest';
import { run } from './html-lint.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('accepts structural HTML', async () => {
  expect(await run({ input: textInput('<main><p>Hello</p></main>') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test('reports malformed HTML syntax', async () => {
  expect(await run({ input: textInput('<div><span></div>') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 1, column: 12 } }] });
});
