import type { ToolRun } from '../types';
import { requireImage, rasterOutput, pixelsOf, stem } from './shared';

export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  const source = await pixelsOf(image.bitmap);
  const { width, height } = source;
  const region = image.region ?? { x: 0, y: 0, width, height };
  const left = Math.max(0, Math.min(width, Math.round(region.x)));
  const top = Math.max(0, Math.min(height, Math.round(region.y)));
  const right = Math.max(left, Math.min(width, Math.round(region.x + region.width)));
  const bottom = Math.max(top, Math.min(height, Math.round(region.y + region.height)));
  const effect = String(options.effect ?? 'pixelate');
  const strength = Math.max(1, Math.min(100, Math.round(Number(options.strength ?? 8)) || 1));
  const data = new Uint8ClampedArray(source.data);
  if (effect === 'black-box') {
    for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) data.set([0, 0, 0, 255], (y * width + x) * 4);
  } else if (effect === 'pixelate') {
    for (let by = top; by < bottom; by += strength) for (let bx = left; bx < right; bx += strength) {
      const xEnd = Math.min(right, bx + strength); const yEnd = Math.min(bottom, by + strength);
      const total = [0, 0, 0, 0]; let count = 0;
      for (let y = by; y < yEnd; y++) for (let x = bx; x < xEnd; x++) { const p = (y * width + x) * 4; for (let c = 0; c < 4; c++) total[c]! += source.data[p + c]!; count++; }
      for (let y = by; y < yEnd; y++) for (let x = bx; x < xEnd; x++) { const p = (y * width + x) * 4; for (let c = 0; c < 4; c++) data[p + c] = Math.round(total[c]! / count); }
    }
  } else if (effect === 'blur') {
    const radius = Math.min(strength, Math.max(width, height));
    const horizontal = new Float64Array((right - left) * (bottom - top) * 4);
    for (let y = top; y < bottom; y++) {
      const sums = [0, 0, 0, 0];
      for (let x = left - radius; x <= left + radius; x++) { const p = (y * width + Math.max(left, Math.min(right - 1, x))) * 4; for (let c = 0; c < 4; c++) sums[c]! += source.data[p + c]!; }
      for (let x = left; x < right; x++) {
        const dest = ((y - top) * (right - left) + x - left) * 4;
        for (let c = 0; c < 4; c++) horizontal[dest + c] = sums[c]! / (2 * radius + 1);
        const remove = (y * width + Math.max(left, x - radius)) * 4;
        const add = (y * width + Math.min(right - 1, x + radius + 1)) * 4;
        for (let c = 0; c < 4; c++) sums[c]! += source.data[add + c]! - source.data[remove + c]!;
      }
    }
    for (let x = left; x < right; x++) {
      const sums = [0, 0, 0, 0];
      for (let y = top - radius; y <= top + radius; y++) { const p = ((Math.max(top, Math.min(bottom - 1, y)) - top) * (right - left) + x - left) * 4; for (let c = 0; c < 4; c++) sums[c]! += horizontal[p + c]!; }
      for (let y = top; y < bottom; y++) {
        const dest = (y * width + x) * 4;
        for (let c = 0; c < 4; c++) data[dest + c] = Math.round(sums[c]! / (2 * radius + 1));
        const remove = ((Math.max(top, y - radius) - top) * (right - left) + x - left) * 4;
        const add = ((Math.min(bottom - 1, y + radius + 1) - top) * (right - left) + x - left) * 4;
        for (let c = 0; c < 4; c++) sums[c]! += horizontal[add + c]! - horizontal[remove + c]!;
      }
    }
  } else throw new Error('Unknown region effect');
  context.signal.throwIfAborted();
  return rasterOutput({ width, height, data }, `${stem(image.name)}-region-blur.png`);
};
