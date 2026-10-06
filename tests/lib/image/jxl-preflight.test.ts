import { afterEach, expect, it, vi } from 'vitest';
import { getCodec } from '../../../lib/image/codecs';
import { decodeImage, inspectImage } from '../../../lib/image/decode';

const large = Uint8Array.from([255, 10, 122, 187, 240, 225, 4]); // 10000 × 6000
const wide = Uint8Array.from([255, 10, 0, 0, 1, 128, 0]); // 16385 × 1
const overflow = Uint8Array.from([255, 10, 254, 255, 255, 255, 241, 255, 255, 255, 15]); // 2^30 × 2^30
const small = Uint8Array.from([255, 10, 8, 0, 4, 0]); // 3 × 2
const signature = Uint8Array.from([0, 0, 0, 12, 74, 88, 76, 32, 13, 10, 135, 10]);

function box(type: string, payload: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(payload.length + 8);
  new DataView(bytes.buffer).setUint32(0, bytes.length);
  bytes.set(new TextEncoder().encode(type), 4);
  bytes.set(payload, 8);
  return bytes;
}

function container(...boxes: Uint8Array[]): Uint8Array {
  const bytes = new Uint8Array(signature.length + boxes.reduce((size, part) => size + part.length, 0));
  bytes.set(signature);
  let offset = signature.length;
  for (const part of boxes) { bytes.set(part, offset); offset += part.length; }
  return bytes;
}

function part(index: number, payload: Uint8Array): Uint8Array {
  const indexed = new Uint8Array(payload.length + 4);
  new DataView(indexed.buffer).setUint32(0, index);
  indexed.set(payload, 4);
  return box('jxlp', indexed);
}

afterEach(() => vi.restoreAllMocks());

it.each([
  ['naked codestream', large],
  ['jxlc box', container(box('jxlc', large))],
  ['split jxlp boxes', container(part(0, large.subarray(0, 3)), part(0x80000001, large.subarray(3)))],
])('rejects a 60 MP %s before invoking the full decoder', async (_, bytes) => {
  const codec = getCodec('jxl');
  vi.spyOn(codec, 'canDecode').mockResolvedValue(true);
  const fullDecode = vi.spyOn(codec, 'decode');
  await expect(decodeImage(bytes)).rejects.toThrow('Image exceeds 50 MP limit (60.0 MP)');
  expect(fullDecode).not.toHaveBeenCalled();
});

it('rejects a side over the canvas limit before full decode', async () => {
  const codec = getCodec('jxl');
  vi.spyOn(codec, 'canDecode').mockResolvedValue(true);
  const fullDecode = vi.spyOn(codec, 'decode');
  await expect(decodeImage(wide)).rejects.toThrow('Image exceeds 16384 px canvas side limit');
  expect(fullDecode).not.toHaveBeenCalled();
});

it('rejects 30-bit dimensions without overflowing the pixel limit calculation', async () => {
  const codec = getCodec('jxl');
  vi.spyOn(codec, 'canDecode').mockResolvedValue(true);
  const fullDecode = vi.spyOn(codec, 'decode');
  expect(inspectImage(overflow)).toMatchObject({ width: 1_073_741_824, height: 1_073_741_824 });
  await expect(decodeImage(overflow)).rejects.toThrow('50 MP limit');
  expect(fullDecode).not.toHaveBeenCalled();
});

it.each([
  ['truncated size header', Uint8Array.from([255, 10, 122])],
  ['truncated box', container(box('jxlc', large).subarray(0, 9))],
  ['missing codestream', container(box('Exif', new Uint8Array(4)))],
  ['out of order fragments', container(part(1, small))],
])('rejects %s with a named JXL dimension error before full decode', async (_, bytes) => {
  const codec = getCodec('jxl');
  vi.spyOn(codec, 'canDecode').mockResolvedValue(true);
  const fullDecode = vi.spyOn(codec, 'decode');
  await expect(decodeImage(bytes)).rejects.toThrow('Cannot inspect jxl dimensions before decode');
  expect(fullDecode).not.toHaveBeenCalled();
});

it('reads a small codestream without asking the full decoder for dimensions', async () => {
  const codec = getCodec('jxl');
  vi.spyOn(codec, 'canDecode').mockResolvedValue(true);
  const bitmap = { width: 3, height: 2, close: vi.fn() } as unknown as ImageBitmap;
  const fullDecode = vi.spyOn(codec, 'decode').mockResolvedValue(bitmap);
  expect(inspectImage(small)).toMatchObject({ format: 'jxl', width: 3, height: 2 });
  await expect(decodeImage(small)).resolves.toMatchObject({ width: 3, height: 2 });
  expect(fullDecode).toHaveBeenCalledOnce();
});
