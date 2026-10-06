import { canvasBlob } from './codecs';

export interface Raster { width: number; height: number; data: Uint8ClampedArray }
export async function pixelsOf(bitmap: ImageBitmap | Raster): Promise<Raster> {
  if ('data' in bitmap) return bitmap;
  if (bitmap.width > 16384 || bitmap.height > 16384) throw new Error('Canvas side exceeds 16384 px limit');
  const surface = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(bitmap.width, bitmap.height) : Object.assign(document.createElement('canvas'), { width: bitmap.width, height: bitmap.height });
  const context = surface.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!context) throw new Error('Canvas is unavailable');
  context.drawImage(bitmap, 0, 0);
  return { width: bitmap.width, height: bitmap.height, data: context.getImageData(0, 0, bitmap.width, bitmap.height).data };
}
export async function blobFromRaster(raster: Raster, mimeType = 'image/png', quality = 0.82): Promise<Blob> {
  if (raster.width > 16384 || raster.height > 16384) throw new Error('Canvas side exceeds 16384 px limit');
  if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') return new Blob([pngBytesFromRaster(raster)], { type: 'image/png' });
  const surface = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(raster.width, raster.height) : Object.assign(document.createElement('canvas'), { width: raster.width, height: raster.height });
  const context = surface.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!context) return new Blob([pngBytesFromRaster(raster)], { type: 'image/png' });
  context.putImageData(new ImageData(new Uint8ClampedArray(raster.data), raster.width, raster.height), 0, 0);
  return canvasBlob(surface, mimeType, quality);
}

function pngBytesFromRaster(raster: Raster): Uint8Array<ArrayBuffer> {
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; }
  const crc = (data: Uint8Array) => { let c = 0xffffffff; for (const byte of data) c = crcTable[(c ^ byte) & 255]! ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const be32 = (number: number) => [number >>> 24 & 255, number >>> 16 & 255, number >>> 8 & 255, number & 255];
  const chunk = (type: string, body: Uint8Array) => {
    const content = new Uint8Array(4 + body.length);
    content.set(new TextEncoder().encode(type)); content.set(body, 4);
    return Uint8Array.from([...be32(body.length), ...content, ...be32(crc(content))]);
  };
  const rows = new Uint8Array(raster.height * (raster.width * 4 + 1));
  for (let y = 0; y < raster.height; y++) rows.set(raster.data.subarray(y * raster.width * 4, (y + 1) * raster.width * 4), y * (raster.width * 4 + 1) + 1);
  const blocks: number[] = [0x78, 0x01];
  for (let p = 0; p < rows.length;) {
    const count = Math.min(65535, rows.length - p);
    blocks.push(p + count === rows.length ? 1 : 0, count & 255, count >>> 8, (~count) & 255, (~count) >>> 8 & 255);
    for (let n = 0; n < count; n++) blocks.push(rows[p + n]!);
    p += count;
  }
  let a = 1; let b = 0;
  for (const byte of rows) { a = (a + byte) % 65521; b = (b + a) % 65521; }
  blocks.push(...be32((b << 16 | a) >>> 0));
  const ihdr = Uint8Array.from([...be32(raster.width), ...be32(raster.height), 8, 6, 0, 0, 0]);
  return Uint8Array.from([137,80,78,71,13,10,26,10, ...chunk('IHDR', ihdr), ...chunk('IDAT', Uint8Array.from(blocks)), ...chunk('IEND', new Uint8Array())]);
}
export function resizeRaster(source: Raster, width: number, height: number): Raster {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const sx = Math.min(source.width - 1, Math.floor(x * source.width / width));
    const sy = Math.min(source.height - 1, Math.floor(y * source.height / height));
    data.set(source.data.subarray((sy * source.width + sx) * 4, (sy * source.width + sx) * 4 + 4), (y * width + x) * 4);
  }
  return { width, height, data };
}
