import { expect, it } from 'vitest';
import { run } from './escape.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };
const escape = (text: string, format: string) => run({ input: textInput(text) }, { format }, context);

it('quotes JSON strings with backslashes and newlines', async () => {
  expect(await escape('a"\\\nb', 'json')).toMatchObject({ kind: 'text', text: '"a\\"\\\\\\nb"' });
});

it('escapes JavaScript single-quoted strings', async () => {
  expect(await escape("a'\\\nb", 'js')).toMatchObject({ kind: 'text', text: "'a\\'\\\\\\nb'" });
});

it('escapes markup ampersands and angle brackets', async () => {
  expect(await escape('a<&>"\'', 'html')).toMatchObject({ kind: 'text', text: 'a&lt;&amp;&gt;&quot;&#39;' });
  expect(await escape('a<&>"\'', 'xml')).toMatchObject({ kind: 'text', text: 'a&lt;&amp;&gt;&quot;&apos;' });
});

it('shell-quotes a single quote safely', async () => {
  expect(await escape("a'b", 'shell')).toMatchObject({ kind: 'text', text: "'a'\\''b'" });
});

it.each([
  ['json', '"🙂\\n"'],
  ['js', "'🙂\\n'"],
  ['html', '🙂\n'],
  ['xml', '🙂\n'],
  ['shell', "'🙂\n'"],
])('preserves a surrogate pair and newline in %s escaping', async (format, expected) => {
  expect(await escape('🙂\n', format)).toMatchObject({ kind: 'text', text: expected });
});
