import { pixelsOf } from './raster';
import { checkImageLimits } from './decode';
import type { EncodeOptions, ImageFormat } from './codecs';

type VendorFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'jxl' | 'heic';
type RawImage = { width: number; height: number; data: Uint8Array | Uint8ClampedArray };
type HeicImage = { get_width: () => number; get_height: () => number; display: (image: ImageData, callback: (image: ImageData | null) => void) => void };
type JSquash = {
  decode: (bytes: ArrayBuffer) => Promise<RawImage>;
  encode: (image: RawImage, options?: Record<string, number | boolean>) => Promise<ArrayBuffer>;
};

const files: Record<VendorFormat, { decode: string; encode?: string }> = {
  png: { decode: 'squoosh_png_bg.wasm', encode: 'squoosh_png_bg.wasm' },
  jpeg: { decode: 'mozjpeg_dec.wasm', encode: 'mozjpeg_enc.wasm' },
  webp: { decode: 'webp_dec.wasm', encode: 'webp_enc.wasm' },
  avif: { decode: 'avif_dec.wasm', encode: 'avif_enc.wasm' },
  jxl: { decode: 'jxl_dec.wasm', encode: 'jxl_enc.wasm' },
  heic: { decode: 'libheif-bundle.mjs' },
};
const available = new Map<string, Promise<boolean>>();

export function vendorAvailable(format: ImageFormat, operation: 'decode' | 'encode'): Promise<boolean> {
  if (!(format in files)) return Promise.resolve(false);
  const filename = files[format as VendorFormat][operation];
  if (!filename || typeof window === 'undefined') return Promise.resolve(false);
  const key = `${format}:${operation}`;
  if (!available.has(key)) available.set(key, fetch(`/vendor/image/${format}/${filename}`, { method: 'HEAD' })
    .then(response => response.ok && !response.headers.get('content-type')?.includes('text/html'))
    .catch(() => false));
  return available.get(key)!;
}

const modules = new Map<VendorFormat, Promise<JSquash>>();
function jsquash(format: VendorFormat): Promise<JSquash> {
  if (!modules.has(format)) {
    const url = `/vendor/image/${format}/codec.mjs`;
    modules.set(format, import(/* @vite-ignore */ url) as Promise<JSquash>);
  }
  return modules.get(format)!;
}

function bitmapFromRaw(raw: RawImage, signal?: AbortSignal): Promise<ImageBitmap> {
  signal?.throwIfAborted();
  if (!raw.width || !raw.height) throw new Error('Decoded image has invalid dimensions');
  checkImageLimits(0, raw.width, raw.height);
  return createImageBitmap(new ImageData(new Uint8ClampedArray(raw.data), raw.width, raw.height));
}

let heifModule: Promise<{ HeifDecoder: new () => { decode: (bytes: Uint8Array) => HeicImage[] } }> | undefined;
async function decodeHeic(bytes: Uint8Array, signal?: AbortSignal): Promise<ImageBitmap> {
  const url = '/vendor/image/heic/libheif-bundle.mjs';
  heifModule ??= import(/* @vite-ignore */ url)
    .then(module => module.default());
  const libheif = await heifModule;
  signal?.throwIfAborted();
  const image = new libheif.HeifDecoder().decode(bytes)[0];
  if (!image) throw new Error('HEIC contains no image');
  return bitmapFromHeicImage(image, signal);
}

export async function bitmapFromHeicImage(image: HeicImage, signal?: AbortSignal): Promise<ImageBitmap> {
  signal?.throwIfAborted();
  const width = image.get_width();
  const height = image.get_height();
  if (!width || !height) throw new Error('HEIC image has invalid dimensions');
  checkImageLimits(0, width, height);
  const frame = await new Promise<ImageData>((resolve, reject) => {
    image.display(new ImageData(width, height), result => result ? resolve(result) : reject(new Error('HEIC processing error')));
  });
  const bitmap = await createImageBitmap(frame);
  if (signal?.aborted) { bitmap.close(); signal.throwIfAborted(); }
  return bitmap;
}

export async function decodeVendor(bytes: Uint8Array, format: VendorFormat, signal?: AbortSignal): Promise<ImageBitmap> {
  signal?.throwIfAborted();
  if (!await vendorAvailable(format, 'decode')) throw new Error(`Cannot decode ${format}; this browser has no decoder and no vendored one`);
  if (format === 'heic') return decodeHeic(bytes, signal);
  const codec = await jsquash(format);
  signal?.throwIfAborted();
  const image = await codec.decode(Uint8Array.from(bytes).buffer);
  const bitmap = await bitmapFromRaw(image, signal);
  if (signal?.aborted) { bitmap.close(); signal.throwIfAborted(); }
  return bitmap;
}

export async function encodeVendor(bitmap: ImageBitmap, format: Exclude<VendorFormat, 'heic'>, options: EncodeOptions, signal?: AbortSignal): Promise<Blob> {
  signal?.throwIfAborted();
  if (!await vendorAvailable(format, 'encode')) throw new Error(`Cannot encode ${format}; this browser has no encoder and no vendored one`);
  const codec = await jsquash(format);
  const raster = await pixelsOf(bitmap);
  signal?.throwIfAborted();
  const quality = Math.max(1, Math.min(100, options.quality ?? 82));
  const nativeOptions: Record<string, number | boolean> = format === 'webp'
    ? { quality, lossless: options.lossless ? 1 : 0 }
    : format === 'avif' || format === 'jxl'
      ? { quality: options.lossless ? 100 : quality, lossless: !!options.lossless }
      : format === 'jpeg' ? { quality } : {};
  const encoded = await codec.encode(raster, nativeOptions);
  signal?.throwIfAborted();
  return new Blob([encoded], { type: `image/${format}` });
}
