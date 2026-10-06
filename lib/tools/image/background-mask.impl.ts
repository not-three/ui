import type { Raster } from '../../image/raster';

export const MODEL_SIDE = 1024;

export function prepareImage(source: Raster, side = MODEL_SIDE): Float32Array {
  const plane = side * side;
  const data = new Float32Array(plane * 3);
  for (let y = 0; y < side; y++) {
    const sy = Math.min(source.height - 1, Math.floor((y + 0.5) * source.height / side));
    for (let x = 0; x < side; x++) {
      const sx = Math.min(source.width - 1, Math.floor((x + 0.5) * source.width / side));
      const pixel = (sy * source.width + sx) * 4;
      const index = y * side + x;
      data[index] = source.data[pixel]! / 255 - 0.5;
      data[plane + index] = source.data[pixel + 1]! / 255 - 0.5;
      data[2 * plane + index] = source.data[pixel + 2]! / 255 - 0.5;
    }
  }
  return data;
}

export function normalizeMask(probabilities: Float32Array, maskWidth: number, maskHeight: number, width: number, height: number): Float32Array {
  if (probabilities.length !== maskWidth * maskHeight) throw new Error('Unexpected model mask dimensions');
  let min = 1; let max = 0;
  for (const value of probabilities) { min = Math.min(min, value); max = Math.max(max, value); }
  const range = max - min;
  const result = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    const fy = Math.max(0, Math.min(maskHeight - 1, (y + 0.5) * maskHeight / height - 0.5));
    const y0 = Math.floor(fy); const y1 = Math.min(maskHeight - 1, y0 + 1); const ty = fy - y0;
    for (let x = 0; x < width; x++) {
      const fx = Math.max(0, Math.min(maskWidth - 1, (x + 0.5) * maskWidth / width - 0.5));
      const x0 = Math.floor(fx); const x1 = Math.min(maskWidth - 1, x0 + 1); const tx = fx - x0;
      const top = probabilities[y0 * maskWidth + x0]! * (1 - tx) + probabilities[y0 * maskWidth + x1]! * tx;
      const bottom = probabilities[y1 * maskWidth + x0]! * (1 - tx) + probabilities[y1 * maskWidth + x1]! * tx;
      const value = top * (1 - ty) + bottom * ty;
      result[y * width + x] = range > 0 ? Math.max(0, Math.min(1, (value - min) / range)) : Math.max(0, Math.min(1, value));
    }
  }
  return result;
}

export function featherMask(mask: Float32Array, width: number, height: number, radius: number): Float32Array {
  if (!Number.isInteger(radius) || radius < 0 || radius > 8) throw new Error('Feather edge must be 0–8 px');
  if (radius === 0) return mask;
  const horizontal = new Float32Array(mask.length);
  const result = new Float32Array(mask.length);
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let offset = -radius; offset <= radius; offset++) sum += mask[y * width + Math.min(width - 1, Math.max(0, offset))]!;
    for (let x = 0; x < width; x++) {
      if (x > 0) {
        sum += mask[y * width + Math.min(width - 1, x + radius)]!;
        sum -= mask[y * width + Math.max(0, x - radius - 1)]!;
      }
      horizontal[y * width + x] = sum / (radius * 2 + 1);
    }
  }
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let offset = -radius; offset <= radius; offset++) sum += horizontal[Math.min(height - 1, Math.max(0, offset)) * width + x]!;
    for (let y = 0; y < height; y++) {
      if (y > 0) {
        sum += horizontal[Math.min(height - 1, y + radius) * width + x]!;
        sum -= horizontal[Math.max(0, y - radius - 1) * width + x]!;
      }
      result[y * width + x] = sum / (radius * 2 + 1);
    }
  }
  return result;
}

export function compositeMask(source: Raster, mask: Float32Array): Raster {
  if (mask.length !== source.width * source.height) throw new Error('Mask size does not match image');
  const data = new Uint8ClampedArray(source.data);
  for (let pixel = 0; pixel < mask.length; pixel++) data[pixel * 4 + 3] = Math.round(data[pixel * 4 + 3]! * mask[pixel]!);
  return { width: source.width, height: source.height, data };
}
