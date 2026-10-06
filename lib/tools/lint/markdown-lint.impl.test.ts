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
test('does not close a backtick fence with tildes', async () => {
  expect(await run({ input: textInput('```js\ncode\n~~~\nmore') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'warning', message: 'Unclosed code fence', position: { line: 1, column: 1 } }] });
});
test('requires the closing fence to be at least as long as its opener', async () => {
  expect(await run({ input: textInput('````js\ncode\n```\nmore') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'warning', message: 'Unclosed code fence', position: { line: 1, column: 1 } }] });
});
