import { expect, it } from 'vitest';
import { checkerBitmap } from '../../image/testing';
import { pixelsOf } from '../../image/raster';
import { context, imageInput, outputPixels, pixel } from '../../../tests/lib/tools/image/pixel-test-helper';
import { run } from './crop.impl';

it('crops the natural pixel rectangle', async () => {
  const source = await pixelsOf(checkerBitmap(4, 3));
  const input = imageInput(source);
  if (input.kind !== 'image') throw new Error('image expected');
  input.region = { x: 1, y: 1, width: 2, height: 2 };
  const output = await run({ input }, { aspect: 'free' }, context);
  expect(output).toMatchObject({ kind: 'image', width: 2, height: 2, filename: 'sample-crop.png' });
  expect(pixel(await outputPixels(output), 0, 0)).toEqual(pixel(source, 1, 1));
});

it('locks a crop to the selected aspect ratio', async () => {
  const source = await pixelsOf(checkerBitmap(8, 8));
  const input = imageInput(source);
  if (input.kind !== 'image') throw new Error('image expected');
  input.region = { x: 1, y: 1, width: 6, height: 6 };
  const output = await run({ input }, { aspect: '4:3' }, context);
  expect(output).toMatchObject({ kind: 'image', width: 7, height: 5 });
});
