import type { ToolRun } from '../types';
import { requireImage, rasterOutput, pixelsOf, stem } from './shared';

export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  const source = await pixelsOf(image.bitmap);
  context.signal.throwIfAborted();
  const region = image.region ?? { x: 0, y: 0, width: source.width, height: source.height };
  const x = Math.max(0, Math.min(source.width - 1, Math.round(region.x)));
  const y = Math.max(0, Math.min(source.height - 1, Math.round(region.y)));
  let width = Math.max(1, Math.min(source.width - x, Math.round(region.width)));
  let height = Math.max(1, Math.min(source.height - y, Math.round(region.height)));
  const aspect = String(options.aspect ?? 'free');
  const ratioText = aspect === 'custom' ? String(options.customRatio ?? '') : aspect;
  const match = ratioText.match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/);
  if (aspect !== 'free') {
    if (!match || Number(match[1]) <= 0 || Number(match[2]) <= 0) throw new Error('Enter a valid aspect ratio such as 4:3');
    const ratio = Number(match[1]) / Number(match[2]);
    height = Math.max(1, Math.min(source.height - y, Math.round(width / ratio)));
    width = Math.max(1, Math.min(source.width - x, Math.round(height * ratio)));
  }
  const data = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row++) data.set(source.data.subarray(((y + row) * source.width + x) * 4, ((y + row) * source.width + x + width) * 4), row * width * 4);
  return rasterOutput({ width, height, data }, `${stem(image.name)}-crop.png`);
};
