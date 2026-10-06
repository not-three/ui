import { expect, it } from 'vitest';
import { solidBitmap } from '../../image/testing';
import type { ToolInput, ToolContext } from '../types';
import { run as exif } from './exif.impl';
import { jpeg as gpsJpeg } from '../../../tests/lib/image/exif-fixture';

const context: ToolContext = { signal: new AbortController().signal, reportProgress: () => {} };
const bitmap = solidBitmap(1, 2, [255, 0, 0, 255]);
const exifPayload = Uint8Array.from([69,120,105,102,0,0,73,73,42,0,8,0,0,0,1,0,18,1,3,0,1,0,0,0,6,0,0,0,0,0,0,0]);
const jpeg = Uint8Array.from([255,216,255,225,0,exifPayload.length+2,...exifPayload,255,218,0,2,7,8,9,255,217]);
const input: ToolInput = { kind: 'image', bitmap, width: 1, height: 2, bytes: jpeg, mimeType: 'image/jpeg', name: 'portrait.jpg' };

it('EXIF viewer returns readable orientation, raw JSON and location warning only with GPS', async () => {
  const result = await exif({ input }, {}, context);
  expect(result.kind).toBe('multi');
  if (result.kind !== 'multi') return;
  expect(result.parts.find(part => part.label === 'Tags')?.output).toMatchObject({ kind: 'table', rows: expect.arrayContaining([['Orientation', 6]]) });
  expect(result.parts.some(part => part.label === 'Location')).toBe(false);
  expect(result.parts.find(part => part.label === 'Raw tags')?.output).toMatchObject({ kind: 'text', text: expect.stringContaining('"Orientation": 6') });
});
it('includes decoded image dimensions when no size tag is stored', async () => {
  const result = await exif({ input }, {}, context);
  expect(result.kind).toBe('multi');
  if (result.kind !== 'multi') return;
  expect(result.parts.find(part => part.label === 'Tags')?.output).toMatchObject({ kind:'table', rows:expect.arrayContaining([['Dimensions','1 × 2 px']]) });
});
it('shows decimal GPS coordinates and a location warning', async () => {
  const source: ToolInput = { ...input, bytes:gpsJpeg() };
  const result = await exif({ input:source }, {}, context);
  expect(result.kind).toBe('multi');
  if (result.kind !== 'multi') return;
  expect(result.parts.find(part => part.label === 'Location')?.output).toMatchObject({
    kind:'table', rows:[[51.5,-7.5,expect.stringContaining('location')]],
  });
});
