import { expect, it } from 'vitest';
import { run } from './minify.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };
const minify = (text: string, format: string) => run({ input: textInput(text) }, { format }, context);

it('minifies JSON and preserves Unicode', async () => {
  expect(await minify('{ "name": "東京" }', 'json')).toMatchObject({ kind: 'text', text: '{"name":"東京"}', language: 'json' });
});

it('reports invalid JSON', async () => {
  expect(await minify('{oops}', 'json')).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});

it('strips CSS comments and whitespace without changing strings or URLs', async () => {
  expect(await minify('a { /* remove */ content: "a /* keep */ b"; background: url("a b.png"); color: red; }', 'css')).toMatchObject({ kind: 'text', text: 'a{content:"a /* keep */ b";background:url("a b.png");color:red}', language: 'css' });
});

it('preserves required spaces in nested calc arithmetic', async () => {
  expect(await minify('a { width: calc(100% + 1px); height: calc(50% - var(--gap)); }', 'css')).toMatchObject({
    kind: 'text', text: 'a{width:calc(100% + 1px);height:calc(50% - var(--gap))}', language: 'css',
  });
});

it('keeps meaningful HTML text spacing and pre, script and style bodies', async () => {
  const source = '<div>hello <b>world</b> friend</div><!-- remove --><pre>  a\n b </pre><script>const x = "a  b";</script><style>a { color: red; }</style>';
  const result = await minify(source, 'html');
  expect(result).toMatchObject({ kind: 'text', language: 'html' });
  if (result.kind !== 'text') return;
  expect(result.text).toContain('hello <b>world</b> friend');
  expect(result.text).toContain('<pre>  a\n b </pre>');
  expect(result.text).toContain('<script>const x = "a  b";</script>');
  expect(result.text).toContain('<style>a { color: red; }</style>');
  expect(result.text).not.toContain('remove');
});
