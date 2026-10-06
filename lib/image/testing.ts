import type { Raster } from './raster';
export function solidBitmap(width: number, height: number, rgba: [number, number, number, number]): ImageBitmap {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let p = 0; p < data.length; p += 4) data.set(rgba, p);
  return { width, height, data } as unknown as ImageBitmap;
}
export function checkerBitmap(width: number, height: number): ImageBitmap {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data.set((x + y) % 2 ? [0, 0, 0, 255] : [255, 255, 255, 255], (y * width + x) * 4);
  return { width, height, data } as unknown as ImageBitmap;
}
export async function pngBytes(bitmap: ImageBitmap): Promise<Uint8Array> {
  const { blobFromRaster, pixelsOf } = await import('./raster');
  return new Uint8Array(await (await blobFromRaster(await pixelsOf(bitmap))).arrayBuffer());
}
export function raster(bitmap: ImageBitmap): Raster { return bitmap as unknown as Raster; }
