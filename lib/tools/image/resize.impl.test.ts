import { expect, it } from 'vitest';
import { checkerBitmap } from '../../image/testing';
import type { ToolInput } from '../types';
import { run } from './resize.impl';

it('resizes a synthetic raster by width and prevents upscaling by default', async () => {
  const bitmap = checkerBitmap(4, 2);
  const input: ToolInput = { kind: 'image', bitmap, width: 4, height: 2, bytes: new Uint8Array(), mimeType: 'image/png', name: 'sample.png' };
  const context = { signal: new AbortController().signal, reportProgress: () => {} };
  expect(await run({ input }, { mode: 'width', width: 2, keepAspect: true, upscale: false }, context)).toMatchObject({ kind: 'image', width: 2, height: 1, filename: 'sample-resize.png' });
  expect(await run({ input }, { mode: 'width', width: 8, keepAspect: true, upscale: false }, context)).toMatchObject({ kind: 'image', width: 4, height: 2 });
});
