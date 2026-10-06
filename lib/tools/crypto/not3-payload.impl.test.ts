import { expect, test } from 'vitest';
import { Crypto } from '@not3/sdk';
import { run } from './not3-payload.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('decrypts an SDK-generated payload and rejects a wrong seed', async () => {
  const seed = Crypto.generateSeed();
  const key = await Crypto.generateKey(seed);
  const payload = await Crypto.encrypt('private note', key);
  expect(await run({ input: textInput(payload), seed: textInput(seed) }, {}, context)).toMatchObject({ kind: 'text', text: 'private note' });
  await expect(run({ input: textInput(payload), seed: textInput(Crypto.generateSeed()) }, {}, context)).rejects.toThrow();
});
