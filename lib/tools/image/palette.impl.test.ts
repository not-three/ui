import { expect, it } from 'vitest';
import { context, imageInput } from '../../../tests/lib/tools/image/pixel-test-helper';
import { run } from './palette.impl';

it('reports the pointed colour and dominant palette shares', async () => {
  const data = new Uint8ClampedArray(4 * 2 * 4);
  for (let p = 0; p < data.length; p += 4) data.set(p < 24 ? [255, 0, 0, 255] : [0, 0, 255, 255], p);
  const input = imageInput({ width: 4, height: 2, data });
  if (input.kind !== 'image') throw new Error('image expected');
  input.point = { x: 3, y: 1 };
  const output = await run({ input }, { swatches: 3 }, context);
  expect(output.kind).toBe('multi');
  if (output.kind !== 'multi') return;
  expect(output.parts[0]).toMatchObject({ label: 'Picked', output: { kind: 'table', rows: [['#0000ff', 'rgb(0, 0, 255)', expect.any(String)]] } });
  expect(output.parts.find(part => part.label === 'Palette')).toMatchObject({ output: { rows: [
    ['#ff0000', 'rgb(255, 0, 0)', '75%'],
    ['#0000ff', 'rgb(0, 0, 255)', '25%'],
  ] } });
});

it('omits Picked when no point was selected', async () => {
  const data = new Uint8ClampedArray([255, 0, 0, 255]);
  const output = await run({ input: imageInput({ width: 1, height: 1, data }) }, { swatches: 6 }, context);
  expect(output.kind === 'multi' && output.parts.map(part => part.label)).toEqual(['Palette']);
});
