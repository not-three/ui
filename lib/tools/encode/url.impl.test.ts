import { expect, it } from 'vitest';
import { run } from './url.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
it('encodes a component and decodes it', async () => {
  expect(await run({ input: textInput('a b/c') }, { mode: 'encode', scope: 'component' }, context)).toMatchObject({ kind: 'text', text: 'a%20b%2Fc' });
  expect(await run({ input: textInput('a%20b%2Fc') }, { mode: 'decode', scope: 'component' }, context)).toMatchObject({ kind: 'text', text: 'a b/c' });
});
it('preserves URL delimiters in full-URL mode and reports malformed escapes', async () => {
  expect(await run({ input: textInput('https://x.test/a b?x=1') }, { mode: 'encode', scope: 'url' }, context)).toMatchObject({ kind: 'text', text: 'https://x.test/a%20b?x=1' });
  await expect(run({ input: textInput('%ZZ') }, { mode: 'decode', scope: 'url' }, context)).rejects.toThrow();
});
