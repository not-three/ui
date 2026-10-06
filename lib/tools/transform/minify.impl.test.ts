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

it('preserves selector spaces before pseudo classes', async () => {
  expect(await minify('div :hover { color: red; }', 'css')).toMatchObject({ kind: 'text', text: 'div :hover{color:red}', language: 'css' });
});

it('preserves math functions and closing parentheses inside quoted URLs', async () => {
  expect(await minify('a { width: min(100% + 1px, 200px); background: url("a)b c.png"); }', 'css')).toMatchObject({
    kind: 'text', text: 'a{width:min(100% + 1px, 200px);background:url("a)b c.png")}', language: 'css',
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

it('keeps literal comment text inside a textarea', async () => {
  expect(await minify('<textarea><!-- literal text --></textarea><!-- remove -->', 'html')).toMatchObject({ kind: 'text', text: '<textarea><!-- literal text --></textarea>', language: 'html' });
});

it('keeps comment-like text inside quoted HTML attributes', async () => {
  expect(await minify('<div data-note="<!-- keep -->">x</div><!-- remove -->', 'html')).toMatchObject({
    kind: 'text', text: '<div data-note="<!-- keep -->">x</div>', language: 'html',
  });
});

it('preserves whitespace between elements that may be inline', async () => {
  expect(await minify('<div style="display:inline">a</div> <span>b</span>', 'html')).toMatchObject({
    kind: 'text', text: '<div style="display:inline">a</div> <span>b</span>', language: 'html',
  });
});

it.each([
  ['pre', '<pre>  a\n b </pre>', '<pre>  a\n b </pre>'],
  ['textarea', '<textarea>  a\n b </textarea>', '<textarea>  a\n b </textarea>'],
  ['code', '<code>  a\n b </code>', '<code>  a\n b </code>'],
  ['inline script', '<script>const x = "<!-- keep -->";</script>', '<script>const x = "<!-- keep -->";</script>'],
  ['inline style', '<style>a::before { content: "  "; }</style>', '<style>a::before { content: "  "; }</style>'],
  ['spaced attributes', '<div  data-a = "a b"   data-b = "c">x</div>', 'data-a="a b" data-b="c"'],
  ['conditional comments', '<!--[if IE]><p>legacy</p><![endif]-->', '<!--[if IE]><p>legacy</p><![endif]-->'],
  ['void and self-closing tags', '<br><img src="x" /><hr/>', '<br><img src="x" /><hr/>'],
])('keeps HTML %s semantics', async (_name, source, expected) => {
  const result = await minify(source, 'html');
  expect(result).toMatchObject({ kind: 'text', language: 'html' });
  if (result.kind === 'text') expect(result.text).toContain(expected);
});

it.each([
  ['calc and var', 'a { width: calc(100% + var(--gap, 1px)); }', 'calc(100% + var(--gap, 1px))'],
  ['quoted URL', 'a { background: url("a)b c.png"); }', 'url("a)b c.png")'],
  ['important declaration', 'a { color: red !important; }', 'red !important'],
  ['media query', '@media screen and (min-width: 600px) { a { color: red; } }', '@media screen and (min-width:600px)'],
  ['comment inside string', 'a { content: "/* keep */"; /* remove */ color: red; }', '"/* keep */"'],
])('keeps CSS %s semantics', async (_name, source, expected) => {
  const result = await minify(source, 'css');
  expect(result).toMatchObject({ kind: 'text', language: 'css' });
  if (result.kind === 'text') expect(result.text).toContain(expected);
});
