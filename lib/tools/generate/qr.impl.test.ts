import { expect, test } from 'vitest';
import { run } from './qr.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('generates PNG bytes for text with size options', async () => {
  const result = await run({ input: textInput('hello') }, { width: 256, margin: 2, errorCorrection: 'M' }, context);
  expect(result.kind).toBe('bytes');
  if (result.kind !== 'bytes') return;
  expect(Array.from(result.bytes.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(new DataView(result.bytes.buffer).getUint32(16)).toBe(256);
});
test('QR content and error correction change the PNG', async () => {
  const first = await run({ input: textInput('alpha') }, { width: 128, errorCorrection: 'L' }, context);
  const second = await run({ input: textInput('beta') }, { width: 128, errorCorrection: 'H' }, context);
  if (first.kind !== 'bytes' || second.kind !== 'bytes') throw new Error('Expected PNG bytes');
  expect(first.bytes).not.toEqual(second.bytes);
});
