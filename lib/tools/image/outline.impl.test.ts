import { expect, it } from 'vitest';
import { context, imageInput, outputPixels, pixel } from '../../../tests/lib/tools/image/pixel-test-helper';
import { run } from './outline.impl';

it('dilates alpha by the requested thickness and places the original on top', async () => {
  const data = new Uint8ClampedArray(21 * 21 * 4);
  data.set([255, 0, 0, 255], (10 * 21 + 10) * 4);
  const output = await run({ input: imageInput({ width: 21, height: 21, data }) }, { thickness: 4, colour: '#ffffff', roundCorners: true, shadow: false }, context);
  const raster = await outputPixels(output);
  expect(pixel(raster, 10, 10)).toEqual([255, 0, 0, 255]);
  expect(pixel(raster, 14, 10)).toEqual([255, 255, 255, 255]);
  expect(pixel(raster, 15, 10)[3]).toBe(0);
  expect(pixel(raster, 13, 13)[3]).toBe(0);
});

it('keeps optional shadow outside a round outline', async () => {
  const data = new Uint8ClampedArray(21 * 21 * 4);
  data.set([255, 0, 0, 255], (10 * 21 + 10) * 4);
  const output = await outputPixels(await run({ input: imageInput({ width: 21, height: 21, data }) }, { thickness: 2, colour: '#00ff00', roundCorners: true, shadow: true }, context));
  expect(pixel(output, 10, 10)).toEqual([255, 0, 0, 255]);
  expect(pixel(output, 10, 15)[3]).toBeGreaterThan(0);
});

it('offers background removal for an opaque image', async () => {
  const data = new Uint8ClampedArray(4 * 4 * 4);
  for (let p = 0; p < data.length; p += 4) data.set([20, 30, 40, 255], p);
  const output = await run({ input: imageInput({ width: 4, height: 4, data }) }, {}, context);
  expect(output.kind).toBe('multi');
  expect(JSON.stringify(output)).toContain('Remove background first');
});
