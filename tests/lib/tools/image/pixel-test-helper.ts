import { inflateSync } from 'node:zlib';
import type { ToolInput, ToolOutput } from '../../../../lib/tools/types';
import type { Raster } from '../../../../lib/image/raster';

export const context = { signal: new AbortController().signal, reportProgress: () => {} };

export function imageInput(raster: Raster, name = 'sample.png'): ToolInput {
  return { kind: 'image', bitmap: raster as unknown as ImageBitmap, width: raster.width, height: raster.height, bytes: new Uint8Array(), mimeType: 'image/png', name };
}

export async function outputPixels(output: ToolOutput): Promise<Raster> {
  const image = output.kind === 'multi' ? output.parts.find(part => part.output.kind === 'image')?.output : output;
  if (!image || image.kind !== 'image') throw new Error('Expected image output');
  const bytes = new Uint8Array(await image.blob.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16); const height = view.getUint32(20);
  const chunks: Uint8Array[] = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = view.getUint32(offset);
    const type = new TextDecoder().decode(bytes.subarray(offset + 4, offset + 8));
    if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) data.set(raw.subarray(y * (width * 4 + 1) + 1, (y + 1) * (width * 4 + 1)), y * width * 4);
  return { width, height, data };
}

export function pixel(raster: Raster, x: number, y: number): number[] {
  return [...raster.data.subarray((y * raster.width + x) * 4, (y * raster.width + x) * 4 + 4)];
}
