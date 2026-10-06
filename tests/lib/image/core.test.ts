import { expect, it, vi } from 'vitest';
import { getCodec, sniffFormat } from '../../../lib/image/codecs';
import { decodeImage, inspectImage } from '../../../lib/image/decode';
import { pixelsOf } from '../../../lib/image/raster';
import { putHandoff, takeHandoff } from '../../../lib/tools/handoff';

it('sniffs image containers from bytes, never filenames', () => {
  expect(sniffFormat(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]))).toBe('png');
  expect(sniffFormat(new Uint8Array([255, 216, 255, 224]))).toBe('jpeg');
  expect(sniffFormat(new TextEncoder().encode('RIFF\0\0\0\0WEBP'))).toBe('webp');
  expect(sniffFormat(new TextEncoder().encode('GIF89a'))).toBe('gif');
  expect(sniffFormat(new TextEncoder().encode('BM'))).toBe('bmp');
  expect(sniffFormat(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBe('svg');
  expect(sniffFormat(new Uint8Array([1, 2, 3]))).toBeNull();
});

it('rejects byte, pixel and canvas limits before browser decode', async () => {
  const png = new Uint8Array(24);
  png.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  new DataView(png.buffer).setUint32(16, 10_000);
  new DataView(png.buffer).setUint32(20, 6_000);
  const decode = vi.fn();
  vi.stubGlobal('createImageBitmap', decode);
  await expect(decodeImage(png)).rejects.toThrow('50 MP');
  expect(decode).not.toHaveBeenCalled();
  new DataView(png.buffer).setUint32(16, 16_385);
  new DataView(png.buffer).setUint32(20, 1);
  await expect(decodeImage(png)).rejects.toThrow('16384');
  expect(decode).not.toHaveBeenCalled();
  const tooManyBytes = new Uint8Array(256 * 1024 * 1024 + 1);
  tooManyBytes.set([255, 10]);
  const jxlDecode = vi.spyOn(getCodec('jxl'), 'decode');
  const heicDecode = vi.spyOn(getCodec('heic'), 'decode');
  await expect(decodeImage(tooManyBytes)).rejects.toThrow('256 MiB');
  tooManyBytes.set([0, 0, 0, 24]);
  tooManyBytes.set(new TextEncoder().encode('ftypheic'), 4);
  await expect(decodeImage(tooManyBytes)).rejects.toThrow('256 MiB');
  expect(jxlDecode).not.toHaveBeenCalled();
  expect(heicDecode).not.toHaveBeenCalled();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('keeps the HEIC image-handle limit and closes an oversized decoded bitmap', async () => {
  const bytes = new TextEncoder().encode('\0\0\0\x18ftypheic');
  expect(inspectImage(bytes).width).toBe(0);
  const close = vi.fn();
  vi.spyOn(getCodec('heic'), 'canDecode').mockResolvedValue(true);
  vi.spyOn(getCodec('heic'), 'decode').mockResolvedValue({ width: 16_385, height: 1, close } as unknown as ImageBitmap);
  await expect(decodeImage(bytes)).rejects.toThrow('16384');
  expect(close).toHaveBeenCalledOnce();
  vi.restoreAllMocks();
});

it('reads JPEG orientation and recognises undecodable metadata containers', () => {
  const jpeg = new Uint8Array([255,216,255,225,0,34,69,120,105,102,0,0,73,73,42,0,8,0,0,0,1,0,18,1,3,0,1,0,0,0,6,0,0,0,0,0,0,0,255,217]);
  expect(inspectImage(jpeg).orientation).toBe(6);
  const heic = new TextEncoder().encode('\0\0\0\x18ftypheic');
  expect(inspectImage(heic).format).toBe('heic');
});

it('rejects oversized AVIF dimensions before decoder use and blocks remote SVG resources', async () => {
  const avif = new Uint8Array(40);
  avif.set(new TextEncoder().encode('ftypavif'), 4);
  avif.set(new TextEncoder().encode('ispe'), 20);
  new DataView(avif.buffer).setUint32(28, 10000);
  new DataView(avif.buffer).setUint32(32, 6000);
  await expect(decodeImage(avif)).rejects.toThrow('50 MP');
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.com/photo.png"/></svg>');
  await expect(decodeImage(svg)).rejects.toThrow('external resources');
});

it('marks GIF first-frame mode only when another frame exists', () => {
  const one = Uint8Array.from(atob('R0lGODlhAQABAAAAACwAAAAAAQABAAACAUwAOw=='), char => char.charCodeAt(0));
  expect(inspectImage(one).animated).toBe(false);
  const two = Uint8Array.from([...one.subarray(0, -1), ...one.subarray(13, -1), 0x3b]);
  expect(inspectImage(two).animated).toBe(true);
});

it('releases a decoded bitmap when cancellation wins the decode race', async () => {
  const png = new Uint8Array(24);
  png.set([137,80,78,71,13,10,26,10]);
  new DataView(png.buffer).setUint32(16, 1);
  new DataView(png.buffer).setUint32(20, 1);
  const controller = new AbortController();
  const close = vi.fn();
  vi.stubGlobal('createImageBitmap', async () => { controller.abort(); return { width: 1, height: 1, close }; });
  try {
    await expect(decodeImage(png, 'one.png', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(close).toHaveBeenCalledOnce();
  } finally { vi.unstubAllGlobals(); }
});

it('names a recognised format when no decoder is installed', async () => {
  const codec = getCodec('jxl');
  vi.spyOn(codec, 'canDecode').mockResolvedValue(false);
  await expect(decodeImage(new Uint8Array([255, 10, 8, 0, 4, 0]))).rejects.toThrow('Cannot decode jxl; this browser has no decoder and no vendored one');
  vi.restoreAllMocks();
});

it('reads animation flags beyond the first kilobyte of a PNG and from AVIF brands', () => {
  const png = new Uint8Array(1200);
  png.set([137,80,78,71,13,10,26,10]);
  const view = new DataView(png.buffer);
  view.setUint32(8, 13); png.set(new TextEncoder().encode('IHDR'), 12);
  view.setUint32(16, 1); view.setUint32(20, 1);
  view.setUint32(33, 1100); png.set(new TextEncoder().encode('tEXt'), 37);
  view.setUint32(1145, 8); png.set(new TextEncoder().encode('acTL'), 1149);
  view.setUint32(1153, 2);
  expect(inspectImage(png).animated).toBe(true);
  const avif = new Uint8Array(24); avif.set(new TextEncoder().encode('ftypavis'), 4);
  expect(inspectImage(avif).animated).toBe(true);
});

it('accepts plain test rasters through the same pixel adapter', async () => {
  const raster = { width: 2, height: 1, data: new Uint8ClampedArray([255,0,0,255,0,0,255,255]) };
  expect(await pixelsOf(raster as unknown as ImageBitmap)).toEqual(raster);
});

it('consumes image handoff exactly once', () => {
  const value = { blob: new Blob(['image']), name: 'sample.png', width: 1, height: 1 };
  putHandoff(value);
  expect(takeHandoff()).toBe(value);
  expect(takeHandoff()).toBeNull();
});
