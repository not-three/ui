import { expect, it } from 'vitest';
import { run } from './diff.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
it('returns both sides and preserves language', async () => {
  expect(await run({ left: textInput('{"a":1}', 'json'), right: textInput('{"a":2}') }, { ignoreWhitespace: false }, context)).toMatchObject({ kind: 'diff', left: '{"a":1}', right: '{"a":2}', language: 'json' });
});
it('normalizes whitespace only when selected', async () => {
  expect(await run({ left: textInput('a  b\n'), right: textInput('a b') }, { ignoreWhitespace: true }, context)).toMatchObject({
    kind: 'diff', left: 'a  b\n', right: 'a b', displayLeft: 'a b', displayRight: 'a b',
  });
});
