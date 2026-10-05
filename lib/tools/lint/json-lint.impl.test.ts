import { expect, it } from 'vitest';
import { run } from './json-lint.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
it('reports valid JSON', async () => {
  expect(await run({ input: textInput('{"ok":true}') }, {}, context)).toMatchObject({ kind: 'report', items: [{ severity: 'success' }] });
});
it('reports a one-based parser error position', async () => {
  const result = await run({ input: textInput('{\n"a": 1,\n}') }, {}, context);
  expect(result).toMatchObject({ kind: 'report', items: [{ severity: 'error', position: { line: 3, column: 1 } }] });
});
