import { expect, test } from 'vitest';
import { run } from './xml-lint.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('accepts well formed XML', async () => {
  expect(await run({ input: textInput('<root><child/></root>') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test('rejects mismatched XML tags', async () => {
  expect(await run({ input: textInput('<root>\n<child></root>') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 2, column: 15 } }] });
});
