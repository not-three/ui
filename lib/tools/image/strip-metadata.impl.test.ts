import { expect, it } from 'vitest';
import { solidBitmap } from '../../image/testing';
import type { ToolInput } from '../types';
import { run } from './strip-metadata.impl';

const exif = Uint8Array.from([69,120,105,102,0,0,73,73,42,0,8,0,0,0,1,0,18,1,3,0,1,0,0,0,6,0,0,0,0,0,0,0]);
const jpeg = Uint8Array.from([255,216,255,225,0,exif.length+2,...exif,255,218,0,2,7,8,9,255,217]);
const input: ToolInput = { kind:'image', bitmap:solidBitmap(1,2,[255,0,0,255]), width:1, height:2, bytes:jpeg, mimeType:'image/jpeg', name:'portrait.jpg' };
const context = { signal:new AbortController().signal, reportProgress:()=>{} };
it('keeps the scan bytes in its output Blob when orientation baking is off', async () => {
  const result = await run({ input }, { keepOrientation:false }, context);
  expect(result.kind).toBe('image');
  if (result.kind === 'image') expect([...new Uint8Array(await result.blob.arrayBuffer())]).toEqual([255,216,255,218,0,2,7,8,9,255,217]);
});
it('bakes orientation from the decoded bitmap when requested', async () => {
  const result = await run({ input }, { keepOrientation:true }, context);
  expect(result).toMatchObject({ kind:'image', width:1, height:2, filename:'portrait-strip-metadata.png' });
  if (result.kind === 'image') {
    const bytes = new Uint8Array(await result.blob.arrayBuffer());
    expect([...bytes.subarray(0,8)]).toEqual([137,80,78,71,13,10,26,10]);
    expect(new TextDecoder().decode(bytes)).not.toContain('Exif');
  }
});
it.each([
  {
    mimeType:'image/png', name:'sample.png',
    bytes:Uint8Array.from([137,80,78,71,13,10,26,10, 0,0,0,1,116,69,88,116,42,0,0,0,0, 0,0,0,1,73,68,65,84,7,0,0,0,0]),
    expected:Uint8Array.from([137,80,78,71,13,10,26,10, 0,0,0,1,73,68,65,84,7,0,0,0,0]),
  },
  {
    mimeType:'image/webp', name:'sample.webp',
    bytes:Uint8Array.from([82,73,70,70,24,0,0,0,87,69,66,80, 69,88,73,70,2,0,0,0,5,6, 86,80,56,32,2,0,0,0,7,8]),
    expected:Uint8Array.from([82,73,70,70,14,0,0,0,87,69,66,80, 86,80,56,32,2,0,0,0,7,8]),
  },
])('keeps $mimeType image payload bytes in its output Blob', async ({ mimeType, name, bytes, expected }) => {
  const source: ToolInput = { ...input, bytes, mimeType, name };
  const result = await run({ input:source }, { keepOrientation:false }, context);
  expect(result.kind).toBe('image');
  if (result.kind === 'image') expect(new Uint8Array(await result.blob.arrayBuffer())).toEqual(expected);
});
