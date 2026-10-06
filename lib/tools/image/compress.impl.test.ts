import { expect, it } from 'vitest';
import { solidBitmap } from '../../image/testing';
import { searchCompression, run } from './compress.impl';
import { getCodec } from '../../image/codecs';
import type { ToolInput } from '../types';

const image: ToolInput = { kind: 'image', bitmap: solidBitmap(2,2,[1,2,3,255]), width: 2, height: 2, bytes: new Uint8Array(2*1024*1024), mimeType: 'image/png', name: 'large.png' };
it('binary searches an achievable 100 KB target in at most eight encodes', async () => {
  let calls = 0;
  const result = await searchCompression(100*1024, async quality => { calls++; return new Blob([new Uint8Array(quality * 2000)]); }, new AbortController().signal);
  expect(result.blob.size).toBeLessThanOrEqual(100*1024);
  expect(result.quality).toBeGreaterThanOrEqual(50);
  expect(calls).toBeLessThanOrEqual(8);
});
it('reports minimum achievable size when target is impossible', async () => {
  const result = await searchCompression(100*1024, async quality => new Blob([new Uint8Array(130000+quality)]), new AbortController().signal);
  expect(result.blob.size).toBe(130001);
  expect(result.metTarget).toBe(false);
  expect(result.iterations).toBeLessThanOrEqual(8);
});
it('uses the export-row format and shows compression report', async () => {
  const codec = getCodec('webp');
  const oldEncode = codec.encode, oldCanEncode = codec.canEncode;
  codec.encode = async (_bitmap, options) => new Blob([new Uint8Array(Number(options.quality)*1000)], { type: 'image/webp' });
  codec.canEncode = async () => true;
  try {
    const result = await run({ input: image }, { target: 'max-size', maxSize: 100, unit: 'KB' }, { signal: new AbortController().signal, reportProgress: () => {}, imageExportFormat: 'webp' });
    expect(result.kind).toBe('multi');
    if (result.kind === 'multi') {
      expect(result.parts[0]?.output).toMatchObject({ kind: 'image', filename: 'large-compress.webp' });
      expect(result.parts[1]?.output).toMatchObject({ kind: 'text', text: expect.stringMatching(/\d+ % → .* KB, \d+ iterations/) });
    }
  } finally { codec.encode = oldEncode; codec.canEncode = oldCanEncode; }
});
it('aborts a search before returning a stale result', async () => {
  const controller = new AbortController();
  await expect(searchCompression(100, async () => { controller.abort(); return new Blob(['x']); }, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
});
it('falls back to an available encoder when WebP cannot encode', async () => {
  const webp = getCodec('webp'), png = getCodec('png');
  const oldWebp = webp.canEncode, oldPng = png.canEncode, oldEncode = png.encode;
  webp.canEncode = async () => false;
  png.canEncode = async () => true;
  png.encode = async () => new Blob([new Uint8Array([1,2,3])], { type:'image/png' });
  try {
    const result = await run({ input:image }, { target:'quality', quality:82 }, { signal:new AbortController().signal, reportProgress:()=>{} });
    expect(result.kind).toBe('multi');
    if (result.kind === 'multi') expect(result.parts[0]?.output).toMatchObject({ kind:'image', filename:'large-compress.png' });
  } finally { webp.canEncode = oldWebp; png.canEncode = oldPng; png.encode = oldEncode; }
});
