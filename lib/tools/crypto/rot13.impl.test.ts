import { expect, test } from 'vitest';
import { run } from './rot13.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('ROT13 round trips ASCII and preserves non-ASCII', async () => {
  const first = await run({ input: textInput('Hello, 🌍 é') }, {}, context);
  expect(first).toMatchObject({ kind: 'text', text: 'Uryyb, 🌍 é' });
  if (first.kind === 'text') expect(await run({ input: textInput(first.text) }, {}, context)).toMatchObject({ text: 'Hello, 🌍 é' });
});
