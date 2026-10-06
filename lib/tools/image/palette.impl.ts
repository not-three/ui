import type { ToolRun } from '../types';
import { requireImage, pixelsOf } from './shared';

interface Colour { r: number; g: number; b: number; count: number }
const hex = (r: number, g: number, b: number) => `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`;
const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;
function hsl(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b) / 255; const min = Math.min(r, g, b) / 255;
  const delta = max - min; const light = (max + min) / 2;
  let hue = 0; let saturation = 0;
  if (delta) {
    saturation = delta / (1 - Math.abs(2 * light - 1));
    if (max === r / 255) hue = ((g - b) / 255 / delta) % 6;
    else if (max === g / 255) hue = (b - r) / 255 / delta + 2;
    else hue = (r - g) / 255 / delta + 4;
    hue = (hue * 60 + 360) % 360;
  }
  return `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(light * 100)}%)`;
}
function splitBucket(bucket: Colour[]): [Colour[], Colour[]] | null {
  if (bucket.length < 2) return null;
  const channels = ['r', 'g', 'b'] as const;
  const limits = { r: [255, 0], g: [255, 0], b: [255, 0] };
  for (const item of bucket) for (const channel of channels) {
    limits[channel][0] = Math.min(limits[channel][0]!, item[channel]);
    limits[channel][1] = Math.max(limits[channel][1]!, item[channel]);
  }
  const channel = channels.reduce((best, next) => limits[next][1]! - limits[next][0]! > limits[best][1]! - limits[best][0]! ? next : best, 'r' as typeof channels[number]);
  const sorted = [...bucket].sort((a, b) => a[channel] - b[channel]);
  const half = sorted.reduce((total, item) => total + item.count, 0) / 2;
  let count = 0; let index = 0;
  while (index < sorted.length - 1 && count < half) count += sorted[index++]!.count;
  return [sorted.slice(0, index), sorted.slice(index)];
}

export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  const raster = await pixelsOf(image.bitmap);
  const parts: { label: string; output: { kind: 'table'; columns: string[]; rows: (string | number)[][] } }[] = [];
  if (image.point) {
    const x = Math.max(0, Math.min(raster.width - 1, Math.round(image.point.x)));
    const y = Math.max(0, Math.min(raster.height - 1, Math.round(image.point.y)));
    const p = (y * raster.width + x) * 4;
    const r = raster.data[p]!; const g = raster.data[p + 1]!; const b = raster.data[p + 2]!;
    parts.push({ label: 'Picked', output: { kind: 'table', columns: ['Hex', 'RGB', 'HSL'], rows: [[hex(r, g, b), rgb(r, g, b), hsl(r, g, b)]] } });
  }
  const scale = Math.min(1, 256 / Math.max(raster.width, raster.height));
  const sampleWidth = Math.max(1, Math.round(raster.width * scale));
  const sampleHeight = Math.max(1, Math.round(raster.height * scale));
  const counts = new Map<number, Colour>(); let total = 0;
  for (let y = 0; y < sampleHeight; y++) for (let x = 0; x < sampleWidth; x++) {
    const sx = Math.min(raster.width - 1, Math.floor(x * raster.width / sampleWidth));
    const sy = Math.min(raster.height - 1, Math.floor(y * raster.height / sampleHeight));
    const p = (sy * raster.width + sx) * 4;
    if (raster.data[p + 3] === 0) continue;
    const r = raster.data[p]!; const g = raster.data[p + 1]!; const b = raster.data[p + 2]!;
    const key = r << 16 | g << 8 | b;
    const colour = counts.get(key);
    if (colour) colour.count++;
    else counts.set(key, { r, g, b, count: 1 });
    total++;
  }
  const target = Math.max(3, Math.min(12, Math.round(Number(options.swatches ?? 6)) || 6));
  const buckets = [[...counts.values()]];
  while (buckets.length < target) {
    context.signal.throwIfAborted();
    let choice = -1; let score = -1;
    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i]!;
      if (bucket.length < 2) continue;
      const low = [255, 255, 255]; const high = [0, 0, 0]; let weight = 0;
      for (const item of bucket) {
        const channels = [item.r, item.g, item.b];
        for (let c = 0; c < 3; c++) { low[c] = Math.min(low[c]!, channels[c]!); high[c] = Math.max(high[c]!, channels[c]!); }
        weight += item.count;
      }
      const spread = high.reduce((sum, value, channel) => sum + value - low[channel]!, 0);
      if (spread * weight > score) { choice = i; score = spread * weight; }
    }
    if (choice < 0) break;
    const split = splitBucket(buckets[choice]!);
    if (!split) break;
    buckets.splice(choice, 1, ...split);
  }
  const rows = buckets.filter(bucket => bucket.length).map(bucket => {
    const count = bucket.reduce((sum, item) => sum + item.count, 0);
    const r = Math.round(bucket.reduce((sum, item) => sum + item.r * item.count, 0) / count);
    const g = Math.round(bucket.reduce((sum, item) => sum + item.g * item.count, 0) / count);
    const b = Math.round(bucket.reduce((sum, item) => sum + item.b * item.count, 0) / count);
    return { count, row: [hex(r, g, b), rgb(r, g, b), `${Math.round(count / total * 100)}%`] as string[] };
  }).sort((a, b) => b.count - a.count).map(item => item.row);
  parts.push({ label: 'Palette', output: { kind: 'table', columns: ['Hex', 'RGB', 'Share'], rows } });
  return { kind: 'multi', parts };
};
