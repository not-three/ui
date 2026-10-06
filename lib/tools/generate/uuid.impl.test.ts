import { expect, test } from 'vitest';
import { run } from './uuid.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test.each(['v4', 'v7'])('generates %s UUID with RFC variant', async version => {
  const result = await run({ input: textInput('') }, { mode: 'generate', version }, context);
  expect(result).toMatchObject({ kind: 'text', text: expect.stringMatching(new RegExp(`^[0-9a-f]{8}-[0-9a-f]{4}-${version[1]}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)) });
});
test('inspects a v7 timestamp', async () => {
  const result = await run({ input: textInput('018f9a20-4000-7000-8000-000000000000') }, { mode: 'inspect' }, context);
  expect(result).toMatchObject({ kind: 'table', rows: expect.arrayContaining([['Version', '7'], ['Timestamp', new Date(0x018f9a204000).toISOString()]]) });
});
test('v7 generation embeds current milliseconds', async () => {
  const before = Date.now();
  const result = await run({ input: textInput('') }, { version: 'v7' }, context);
  const after = Date.now();
  if (result.kind !== 'text') throw new Error('Expected UUID text');
  const milliseconds = Number.parseInt(result.text.replaceAll('-', '').slice(0, 12), 16);
  expect(milliseconds).toBeGreaterThanOrEqual(before);
  expect(milliseconds).toBeLessThanOrEqual(after);
});
test('rejects malformed UUID inspection', async () => {
  expect(await run({ input: textInput('oops') }, { mode: 'inspect' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
