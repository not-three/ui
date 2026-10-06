import { expect, it } from 'vitest';
import { run } from './markdown-html.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };

it('renders Markdown syntax and identifies HTML output', async () => {
  const result = await run({ input: textInput('# Hi\n\n**bold** and [link](https://example.com)') }, {}, context);
  expect(result).toMatchObject({ kind: 'text', language: 'html' });
  if (result.kind === 'text') expect(result.text).toContain('<strong>bold</strong>');
});

it('does not render raw HTML from untrusted Markdown', async () => {
  const result = await run({ input: textInput('<script>alert(1)</script>') }, {}, context);
  if (result.kind === 'text') expect(result.text).toContain('&lt;script&gt;');
});

it.each([
  ['heading', '# 東京', '<h1>東京</h1>'],
  ['emphasis', '*café*', '<em>café</em>'],
  ['literal HTML', '<b>unsafe</b>', '&lt;b&gt;unsafe&lt;/b&gt;'],
])('renders %s as safe HTML', async (_name, source, expected) => {
  const result = await run({ input: textInput(source) }, {}, context);
  expect(result).toMatchObject({ kind: 'text', language: 'html' });
  if (result.kind === 'text') expect(result.text).toContain(expected);
});
