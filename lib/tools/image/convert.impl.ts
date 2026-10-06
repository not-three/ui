import type { ToolRun } from '../types';
import { requireImage, rasterOutput, pixelsOf, stem } from './shared';
export const run: ToolRun = async inputs => {
  const image = requireImage(inputs.input);
  return rasterOutput(await pixelsOf(image.bitmap), `${stem(image.name)}.png`);
};
