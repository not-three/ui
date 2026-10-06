import { expect, test } from 'vitest';
import { run } from './aes.impl';
import { bytesInput, chunksInput, textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
const password = textInput('correct horse battery staple');
test.each(['gcm', 'cbc'])('round trips multi-chunk file bytes in %s with password', async mode => {
  const encrypted = await run({ input: chunksInput([new Uint8Array([0, 1]), new Uint8Array([2, 255])]), key: password }, { operation: 'encrypt', mode, keyMode: 'password' }, context);
  expect(encrypted.kind).toBe('bytes');
  if (encrypted.kind !== 'bytes') return;
  const decrypted = await run({ input: bytesInput(encrypted.bytes), key: password }, { operation: 'decrypt', mode, keyMode: 'password' }, context);
  expect(decrypted).toMatchObject({ kind: 'bytes', bytes: new Uint8Array([0, 1, 2, 255]) });
});
test('armors text and rejects wrong password', async () => {
  const encrypted = await run({ input: textInput('hello'), key: password }, { operation: 'encrypt', mode: 'gcm', keyMode: 'password' }, context);
  expect(encrypted.kind).toBe('text');
  if (encrypted.kind !== 'text') return;
  await expect(run({ input: textInput(encrypted.text), key: textInput('wrong') }, { operation: 'decrypt', mode: 'gcm', keyMode: 'password' }, context)).rejects.toThrow(/authentication|password|cipher/i);
});
test('rejects malformed ciphertext and invalid raw key', async () => {
  await expect(run({ input: textInput('bad'), key: password }, { operation: 'decrypt', mode: 'gcm', keyMode: 'password' }, context)).rejects.toThrow(/cipher|base64/i);
  await expect(run({ input: textInput('x'), key: textInput('xyz') }, { operation: 'encrypt', mode: 'gcm', keyMode: 'raw' }, context)).rejects.toThrow(/key/i);
});
test('CBC detects a changed ciphertext even when padding survives', async () => {
  const encrypted = await run({ input: bytesInput(new Uint8Array(64).fill(65)), key: password }, { operation: 'encrypt', mode: 'cbc', keyMode: 'password' }, context);
  if (encrypted.kind !== 'bytes') throw new Error('Expected bytes');
  const altered = encrypted.bytes.slice();
  altered[24] = altered[24]! ^ 1;
  await expect(run({ input: bytesInput(altered), key: password }, { operation: 'decrypt', mode: 'cbc', keyMode: 'password' }, context)).rejects.toThrow(/authentication|cipher/i);
});
test('round trips an empty text and rejects a file above the browser limit before reading', async () => {
  const encrypted = await run({ input: textInput(''), key: password }, { operation: 'encrypt', mode: 'gcm', keyMode: 'password' }, context);
  if (encrypted.kind !== 'text') throw new Error('Expected armored text');
  expect(await run({ input: textInput(encrypted.text), key: password }, { operation: 'decrypt', mode: 'gcm', keyMode: 'password' }, context)).toMatchObject({ kind: 'text', text: '' });
  const oversize = { kind: 'bytes' as const, stream: new ReadableStream<Uint8Array>(), size: 64 * 1024 * 1024 + 1 };
  await expect(run({ input: oversize, key: password }, { operation: 'encrypt', mode: 'gcm', keyMode: 'password' }, context)).rejects.toThrow(/64 MiB/);
});
test('round trips a raw hex key', async () => {
  const key = textInput('00'.repeat(32));
  const encrypted = await run({ input: textInput('raw secret'), key }, { operation: 'encrypt', mode: 'gcm', keyMode: 'raw' }, context);
  if (encrypted.kind !== 'text') throw new Error('Expected armored text');
  expect(await run({ input: textInput(encrypted.text), key }, { operation: 'decrypt', mode: 'gcm', keyMode: 'raw' }, context)).toMatchObject({ kind: 'text', text: 'raw secret' });
});
