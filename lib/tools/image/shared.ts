import type { ToolInput } from '../types';
import { blobFromRaster, pixelsOf, type Raster } from '../../image/raster';

export function requireImage(value: ToolInput | undefined): Extract<ToolInput, {kind: 'image'}> {
  if (!value || value.kind !== 'image') throw new Error('Image required');
  if (value.width < 1 || value.height < 1) throw new Error('Image has no decodable pixels');
  return value;
}
export function stem(name?: string): string { return (name ?? 'image').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '-'); }
export async function rasterOutput(raster: Raster, filename: string) {
  return { kind: 'image' as const, blob: await blobFromRaster(raster), width: raster.width, height: raster.height, filename };
}
export { pixelsOf };
