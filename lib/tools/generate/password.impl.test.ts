import { expect, test } from 'vitest';
import { run } from './password.impl';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('generates random secret with entropy and only selected characters', async () => {
  const output = await run({}, { length: 32, lowercase: false, uppercase: false, digits: true, symbols: false }, context);
  expect(output).toMatchObject({ kind: 'multi', parts: [{ output: { kind: 'text', text: expect.stringMatching(/^[0-9]{32}$/) } }, { output: { kind: 'table', rows: [[expect.any(Number)]] } }] });
});
test('rejects length and empty charset boundaries', async () => {
  await expect(run({}, { length: 0, lowercase: true }, context)).rejects.toThrow(/length/i);
  await expect(run({}, { length: 8, lowercase: false, uppercase: false, digits: false, symbols: false }, context)).rejects.toThrow(/character/i);
});
