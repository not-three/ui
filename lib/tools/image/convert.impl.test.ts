import { expect, it } from 'vitest';
import { solidBitmap } from '../../image/testing';
import type { ToolInput } from '../types';
import { run } from './convert.impl';

it('converts a synthetic raster without changing dimensions or stem', async () => {
  const bitmap = solidBitmap(2, 3, [255, 0, 0, 255]);
  const input: ToolInput = { kind: 'image', bitmap, width: 2, height: 3, bytes: new Uint8Array(), mimeType: 'image/png', name: 'sample.png' };
  const result = await run({ input }, {}, { signal: new AbortController().signal, reportProgress: () => {} });
  expect(result).toMatchObject({ kind: 'image', width: 2, height: 3, filename: 'sample.png' });
  if (result.kind === 'image') expect(new Uint8Array(await result.blob.arrayBuffer()).subarray(0, 8)).toEqual(new Uint8Array([137,80,78,71,13,10,26,10]));
});
