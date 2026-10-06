import { expect, it } from 'vitest';
import { checkerBitmap } from '../../image/testing';
import type { ToolInput } from '../types';
import { run } from './rotate.impl';

it('rotates and flips synthetic raster dimensions', async () => {
  const bitmap = checkerBitmap(2, 3);
  const input: ToolInput = { kind: 'image', bitmap, width: 2, height: 3, bytes: new Uint8Array(), mimeType: 'image/png', name: 'sample.png' };
  const result = await run({ input }, { angle: '90', flipHorizontal: true, flipVertical: false }, { signal: new AbortController().signal, reportProgress: () => {} });
  expect(result).toMatchObject({ kind: 'image', width: 3, height: 2, filename: 'sample-rotate.png' });
  if (result.kind === 'image') expect(new Uint8Array(await result.blob.arrayBuffer()).subarray(0, 8)).toEqual(new Uint8Array([137,80,78,71,13,10,26,10]));
});
