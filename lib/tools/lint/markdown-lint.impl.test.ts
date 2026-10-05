import { expect, test } from 'vitest';
import { run } from './markdown-lint.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('accepts headed Markdown', async () => {
  expect(await run({ input: textInput('# Title\n\nBody') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test('reports skipped heading levels with source position', async () => {
  expect(await run({ input: textInput('# Title\n\n### Deep') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'warning', position: { line: 3, column: 1 } }] });
});
