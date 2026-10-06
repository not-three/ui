import type { ToolRun } from '../types';
import { resizeRaster } from '../../image/raster';
import { requireImage, rasterOutput, pixelsOf, stem } from './shared';
export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  const mode = String(options.mode ?? 'width');
  const width = Number(options.width ?? 1024);
  const height = Number(options.height ?? 1024);
  const percent = Number(options.percent ?? 50);
  const keepAspect = options.keepAspect !== false;
  const upscale = options.upscale === true;
  let w: number; let h: number;
  if (mode === 'width') { w = width; h = keepAspect ? image.height * w / image.width : height; }
  else if (mode === 'height') { h = height; w = keepAspect ? image.width * h / image.height : width; }
  else if (mode === 'percent') { w = image.width * percent / 100; h = image.height * percent / 100; }
  else { const factor = Math.min(width / image.width, height / image.height); w = image.width * factor; h = image.height * factor; }
  if (!upscale) { const factor = Math.min(1, image.width / w, image.height / h); w *= factor; h *= factor; }
  w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w > 16384 || h > 16384 || w * h > 50_000_000) throw new Error('Resize exceeds image limits');
  context.signal.throwIfAborted();
  return rasterOutput(resizeRaster(await pixelsOf(image.bitmap), w, h), `${stem(image.name)}-resize.png`);
};
