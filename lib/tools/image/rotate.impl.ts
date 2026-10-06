import type { ToolRun } from '../types';
import { requireImage, rasterOutput, pixelsOf, stem } from './shared';
export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  const source = await pixelsOf(image.bitmap);
  const angle = Number(options.angle ?? 0);
  if (![0, 90, 180, 270].includes(angle)) throw new Error('Invalid rotation');
  const width = angle % 180 ? source.height : source.width;
  const height = angle % 180 ? source.width : source.height;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if ((y & 255) === 0) context.signal.throwIfAborted();
    const dx = options.flipHorizontal ? width - 1 - x : x;
    const dy = options.flipVertical ? height - 1 - y : y;
    const sx = angle === 90 ? dy : angle === 180 ? source.width - 1 - dx : angle === 270 ? source.width - 1 - dy : dx;
    const sy = angle === 90 ? source.height - 1 - dx : angle === 180 ? source.height - 1 - dy : angle === 270 ? dx : dy;
    data.set(source.data.subarray((sy * source.width + sx) * 4, (sy * source.width + sx) * 4 + 4), (y * width + x) * 4);
  }
  return rasterOutput({ width, height, data }, `${stem(image.name)}-rotate.png`);
};
