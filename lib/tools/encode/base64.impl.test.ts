import { expect, it } from 'vitest';
import { run } from './base64.impl';
import { bytesInput, textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };
it('encodes UTF-8 bytes and decodes back to bytes', async () => {
  const encoded = await run({ input: textInput('é') }, { mode: 'encode', urlSafe: false }, context);
  expect(encoded).toMatchObject({ kind: 'text', text: 'w6k=' });
  const decoded = await run({ input: textInput('w6k=') }, { mode: 'decode', urlSafe: false }, context);
  expect(decoded.kind).toBe('bytes');
  if (decoded.kind === 'bytes') {
    expect(decoded.bytes).toEqual(new TextEncoder().encode('é'));
    expect(decoded.text).toBe('é');
  }
});
it('keeps invalid UTF-8 as raw bytes without a text action', async () => {
  const decoded = await run({ input: textInput('//4=') }, { mode: 'decode', urlSafe: false }, context);
  expect(decoded).toMatchObject({ kind: 'bytes', bytes: new Uint8Array([255, 254]) });
  if (decoded.kind === 'bytes') expect(decoded.text).toBeUndefined();
});
it('rejects malformed base64', async () => {
  await expect(run({ input: textInput('%%') }, { mode: 'decode', urlSafe: false }, context)).rejects.toThrow();
});
it('supports URL-safe output from raw bytes', async () => {
  expect(await run({ input: bytesInput(new Uint8Array([251, 255])) }, { mode: 'encode', urlSafe: true }, context)).toMatchObject({ kind: 'text', text: '-_8' });
});
