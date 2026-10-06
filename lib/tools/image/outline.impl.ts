import type { ToolRun } from '../types';
import { requireImage, rasterOutput, pixelsOf, stem } from './shared';

const INF = 1_000_000_000;

// Exact squared Euclidean distance transform of a row of vertical distances.
function distanceRow(values: Uint32Array, width: number): Float64Array {
  const sites = new Int32Array(width);
  const boundaries = new Float64Array(width + 1);
  const result = new Float64Array(width);
  let top = 0;
  sites[0] = 0; boundaries[0] = -Infinity; boundaries[1] = Infinity;
  for (let q = 1; q < width; q++) {
    let intersection: number;
    do {
      const site = sites[top]!;
      intersection = ((values[q]! + q * q) - (values[site]! + site * site)) / (2 * (q - site));
      if (intersection <= boundaries[top]!) top--;
      else break;
    } while (top >= 0);
    top++;
    sites[top] = q; boundaries[top] = intersection; boundaries[top + 1] = Infinity;
  }
  top = 0;
  for (let q = 0; q < width; q++) {
    while (boundaries[top + 1]! < q) top++;
    const site = sites[top]!;
    result[q] = (q - site) ** 2 + values[site]!;
  }
  return result;
}

function colour(text: string): [number, number, number] {
  const match = text.match(/^#([\da-f]{6}|[\da-f]{3})$/i);
  if (!match) throw new Error('Enter a hex colour such as #ffffff');
  const digits = match[1]!.length === 3 ? [...match[1]!].map(value => value + value).join('') : match[1]!;
  return [0, 2, 4].map(index => parseInt(digits.slice(index, index + 2), 16)) as [number, number, number];
}

function over(data: Uint8ClampedArray, p: number, r: number, g: number, b: number, alpha: number) {
  const oldAlpha = data[p + 3]! / 255;
  const incoming = alpha / 255;
  const combined = incoming + oldAlpha * (1 - incoming);
  if (!combined) return;
  data[p] = Math.round((r * incoming + data[p]! * oldAlpha * (1 - incoming)) / combined);
  data[p + 1] = Math.round((g * incoming + data[p + 1]! * oldAlpha * (1 - incoming)) / combined);
  data[p + 2] = Math.round((b * incoming + data[p + 2]! * oldAlpha * (1 - incoming)) / combined);
  data[p + 3] = Math.round(combined * 255);
}

export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  const source = await pixelsOf(image.bitmap);
  const { width, height } = source;
  const filename = `${stem(image.name)}-outline.png`;
  if (source.data.every((value, index) => index % 4 !== 3 || value === 255)) {
    return { kind: 'multi', parts: [
      { label: 'Hint', output: { kind: 'report', items: [{ level: 'info', message: 'Remove background first, then use Continue with… to open Remove background.' }] } },
      { label: 'Original image', output: { ...await rasterOutput(source, filename), continueWith: { toolId: 'remove-background', label: 'Remove background first' } } },
    ] };
  }
  const thickness = Math.max(0, Math.min(128, Math.round(Number(options.thickness ?? 12)) || 0));
  const [r, g, b] = colour(String(options.colour ?? '#ffffff'));
  const roundCorners = options.roundCorners !== false;
  const shadow = options.shadow === true;
  const vertical = new Uint32Array(width * height);
  for (let x = 0; x < width; x++) {
    let nearest = -INF;
    for (let y = 0; y < height; y++) {
      const p = (y * width + x) * 4;
      if (source.data[p + 3]! > 0) nearest = y;
      vertical[y * width + x] = nearest < 0 ? INF : (y - nearest) ** 2;
    }
    nearest = INF;
    for (let y = height - 1; y >= 0; y--) {
      if (source.data[(y * width + x) * 4 + 3]! > 0) nearest = y;
      vertical[y * width + x] = Math.min(vertical[y * width + x]!, nearest === INF ? INF : (nearest - y) ** 2);
    }
  }
  const mask = new Uint8Array(width * height);
  const limit = thickness * thickness;
  for (let y = 0; y < height; y++) {
    context.signal.throwIfAborted();
    const row = vertical.subarray(y * width, (y + 1) * width);
    if (roundCorners) {
      const distances = distanceRow(row, width);
      for (let x = 0; x < width; x++) if (distances[x]! <= limit) mask[y * width + x] = 255;
    } else {
      let nearest = -INF;
      for (let x = 0; x < width; x++) { if (row[x]! <= limit) nearest = x; if (x - nearest <= thickness) mask[y * width + x] = 255; }
      nearest = INF;
      for (let x = width - 1; x >= 0; x--) { if (row[x]! <= limit) nearest = x; if (nearest - x <= thickness) mask[y * width + x] = 255; }
    }
  }
  const data = new Uint8ClampedArray(source.data.length);
  if (shadow) {
    const columns = new Uint16Array(width);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        columns[x] = columns[x]! + mask[y * width + x]! - (y >= 5 ? mask[(y - 5) * width + x]! : 0);
      }
      let count = 0;
      for (let x = 0; x < width; x++) {
        count += columns[x]! - (x >= 5 ? columns[x - 5]! : 0);
        if (count) over(data, (y * width + x) * 4, 0, 0, 0, Math.round(count / 25 * 0.35));
      }
    }
  }
  for (let p = 0; p < mask.length; p++) {
    if (mask[p]) over(data, p * 4, r, g, b, mask[p]!);
    const alpha = source.data[p * 4 + 3]!;
    if (alpha) over(data, p * 4, source.data[p * 4]!, source.data[p * 4 + 1]!, source.data[p * 4 + 2]!, alpha);
  }
  return rasterOutput({ width, height, data }, filename);
};
