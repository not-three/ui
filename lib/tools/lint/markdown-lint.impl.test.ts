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
test.each([
  ['matching backticks', '```js\ncode\n```', true],
  ['longer backtick closer', '```js\ncode\n````', true],
  ['matching tildes', '~~~js\ncode\n~~~', true],
  ['longer tilde closer', '~~~js\ncode\n~~~~', true],
  ['three-space indentation', '```js\ncode\n   ```', true],
  ['trailing spaces', '```js\ncode\n```   ', true],
  ['tilde after backtick', '```js\ncode\n~~~\nmore', false],
  ['backtick after tilde', '~~~js\ncode\n```\nmore', false],
  ['shorter closer', '````js\ncode\n```\nmore', false],
  ['four-space indentation', '```js\ncode\n    ```', false],
  ['tab indentation', '```js\ncode\n\t```', false],
] as const)('checks Markdown fence closure with %s', async (_case, source, closed) => {
  expect(await run({ input: textInput(source) }, {}, context)).toMatchObject({ kind: 'report', items: [closed
    ? { level: 'success' }
    : { level: 'warning', message: 'Unclosed code fence', position: { line: 1, column: 1 } }] });
});
