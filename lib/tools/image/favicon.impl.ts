import type { ToolRun, ToolSingleOutput } from '../types';
import { blobFromRaster, pixelsOf, resizeRaster, type Raster } from '../../image/raster';
import { requireImage } from './shared';

const SIZES = [16,32,48,64,128,180,192,512] as const;
export function squareRaster(source: Raster): Raster {
  const side = Math.min(source.width, source.height);
  const left = Math.floor((source.width - side) / 2);
  const top = Math.floor((source.height - side) / 2);
  const data = new Uint8ClampedArray(side * side * 4);
  for (let y = 0; y < side; y++) {
    const row = ((top + y) * source.width + left) * 4;
    data.set(source.data.subarray(row, row + side * 4), y * side * 4);
  }
  return { width: side, height: side, data };
}
function ico(entries: { size: number; bytes: Uint8Array }[]): Uint8Array {
  const total = 6 + entries.length * 16 + entries.reduce((n, item) => n + item.bytes.length, 0);
  const output = new Uint8Array(total);
  const view = new DataView(output.buffer);
  view.setUint16(2, 1, true);
  view.setUint16(4, entries.length, true);
  let offset = 6 + entries.length * 16;
  for (let i = 0; i < entries.length; i++) {
    const item = entries[i]!; const p = 6 + i * 16;
    output[p] = item.size === 256 ? 0 : item.size;
    output[p + 1] = item.size === 256 ? 0 : item.size;
    view.setUint16(p + 4, 1, true);
    view.setUint16(p + 6, 32, true);
    view.setUint32(p + 8, item.bytes.length, true);
    view.setUint32(p + 12, offset, true);
    output.set(item.bytes, offset); offset += item.bytes.length;
  }
  return output;
}
export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  const source = squareRaster(await pixelsOf(image.bitmap));
  const selected = SIZES.filter(size => options[`size${size}`] !== false);
  if (!selected.length) throw new Error('Select at least one favicon size');
  const parts: { label: string; output: ToolSingleOutput }[] = [];
  const icoEntries: { size: number; bytes: Uint8Array }[] = [];
  const pngs = new Map<number, Blob>();
  for (const size of new Set([...selected,16,32,48])) {
    context.signal.throwIfAborted();
    const blob = await blobFromRaster(resizeRaster(source, size, size));
    pngs.set(size, blob);
    if ([16,32,48].includes(size)) icoEntries.push({ size, bytes: new Uint8Array(await blob.arrayBuffer()) });
    context.reportProgress(pngs.size / new Set([...selected,16,32,48]).size);
  }
  context.signal.throwIfAborted();
  const icoBytes = ico(icoEntries.sort((a, b) => a.size - b.size));
  parts.push({ label: 'favicon.ico', output: { kind: 'image', blob: new Blob([icoBytes as BlobPart], { type: 'image/x-icon' }), width: 48, height: 48, filename: 'favicon.ico', exportable: false } });
  for (const size of selected) parts.push({ label: `${size} × ${size} PNG`, output: { kind: 'image', blob: pngs.get(size)!, width: size, height: size, filename: `icon-${size}.png`, exportable: false } });
  const links = ['<link rel="icon" href="/favicon.ico" sizes="any">', ...selected.map(size => `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/icon-${size}.png">`), '<link rel="manifest" href="/site.webmanifest">'];
  const manifest = { icons: selected.map(size => ({ src: `/icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' })) };
  parts.push({ label: 'HTML', output: { kind: 'text', text: links.join('\n'), language: 'html', filename: 'favicon-links.html' } });
  parts.push({ label: 'Manifest', output: { kind: 'text', text: JSON.stringify(manifest, null, 2), language: 'json', filename: 'site.webmanifest' } });
  if (image.width !== image.height) parts.push({ label: 'Crop note', output: { kind: 'text', text: 'The image was centre-cropped to a square.', language: 'plaintext' } });
  return { kind: 'multi', parts };
};
