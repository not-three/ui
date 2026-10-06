import { expect, test } from 'vitest';
import { solidBitmap, raster } from '../../image/testing';
import { compositeMask, featherMask, normalizeMask, prepareImage } from './background-mask.impl';

test('prepares planar RGB input at model size using x / 255 - 0.5', () => {
  const source = raster(solidBitmap(2, 1, [255, 0, 128, 255]));
  source.data.set([0, 255, 64, 255], 4);
  const tensor = prepareImage(source, 2);
  expect([...tensor]).toEqual([0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,
    expect.closeTo(128 / 255 - 0.5, 6), expect.closeTo(64 / 255 - 0.5, 6),
    expect.closeTo(128 / 255 - 0.5, 6), expect.closeTo(64 / 255 - 0.5, 6)]);
});

test('normalizes sigmoid probabilities and resizes the mask', () => {
  const mask = normalizeMask(new Float32Array([0.1, 0.9]), 2, 1, 4, 1);
  expect([...mask]).toEqual([0, 0.25, 0.75, 1]);
});

test('feathers up to 8 pixels and composites with existing alpha', () => {
  const mask = new Float32Array([0, 0, 1, 0, 0]);
  expect([...featherMask(mask, 5, 1, 0)]).toEqual([...mask]);
  const soft = featherMask(mask, 5, 1, 2);
  expect(soft[1]).toBeGreaterThan(0);
  expect(soft[2]).toBeLessThan(1);
  expect(() => featherMask(mask, 5, 1, 9)).toThrow('0–8');
  const source = raster(solidBitmap(1, 1, [20, 30, 40, 128]));
  expect([...compositeMask(source, new Float32Array([0.5])).data]).toEqual([20, 30, 40, 64]);
});
