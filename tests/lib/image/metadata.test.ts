import { expect, it } from 'vitest';
import { readExif, stripMetadata } from '~/lib/image/metadata';
import { jpeg, png, webp, chunk } from './exif-fixture';
const ascii = (s: string) => [...new TextEncoder().encode(s)];

it.each([jpeg(), png(), webp()])('reads EXIF tags and decimal GPS from supported containers', bytes => {
  const result = readExif(bytes);
  expect(result.tags.Make).toBe('Canon');
  expect(result.orientation).toBe(6);
  expect(result.gps).toEqual({ latitude: 51.5, longitude: -7.5 });
});

it('ignores malformed and truncated metadata without reading beyond the segment', () => {
  expect(readExif(jpeg(Uint8Array.from([...ascii('Exif\0\0'),73,73,42,0,255,255,255,127]))).tags).toEqual({});
  expect(readExif(Uint8Array.from([255,216,255,225,0,100,1,2,3])).tags).toEqual({});
});

it('removes JPEG APP1/APP13 while preserving entropy-coded scan bytes', () => {
  const source = Uint8Array.from([255,216,255,237,0,4,9,8,...jpeg().subarray(2)]);
  const stripped = stripMetadata(source, 'jpeg');
  expect([...stripped]).toEqual([255,216,255,218,0,2,1,2,3,255,217]);
});

it('removes PNG metadata chunks and preserves the IDAT bytes', () => {
  expect([...stripMetadata(png(), 'png')]).toEqual([137,80,78,71,13,10,26,10,0,0,0,1,...ascii('IDAT'),42,0,0,0,0]);
});

it('removes WebP EXIF and updates RIFF size', () => {
  const stripped = stripMetadata(webp(), 'webp');
  expect([...stripped]).toEqual([...ascii('RIFF'),14,0,0,0,...ascii('WEBP'),...chunk('VP8 ',Uint8Array.from([1,2]))]);
});
