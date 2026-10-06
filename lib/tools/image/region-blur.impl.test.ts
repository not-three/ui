import { expect, it } from 'vitest';
import { checkerBitmap } from '../../image/testing';
import { pixelsOf } from '../../image/raster';
import { context, imageInput, outputPixels, pixel } from '../../../tests/lib/tools/image/pixel-test-helper';
import { run } from './region-blur.impl';

for (const effect of ['pixelate', 'blur', 'black-box']) it(`${effect} changes only the selected region`, async () => {
  const source = await pixelsOf(checkerBitmap(6, 6));
  const input = imageInput(source);
  if (input.kind !== 'image') throw new Error('image expected');
  input.region = { x: 2, y: 2, width: 3, height: 3 };
  const output = await outputPixels(await run({ input }, { effect, strength: 3 }, context));
  expect(pixel(output, 0, 0)).toEqual(pixel(source, 0, 0));
  expect(pixel(output, 5, 5)).toEqual(pixel(source, 5, 5));
  expect(pixel(output, 2, 2)).not.toEqual(pixel(source, 2, 2));
});
