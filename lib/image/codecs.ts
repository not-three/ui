export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'jxl' | 'gif' | 'bmp' | 'svg' | 'heic' | 'ico';
export interface EncodeOptions { quality?: number; lossless?: boolean }
export interface Codec {
  format: ImageFormat;
  mimeType: string;
  extensions: string[];
  canDecode: () => Promise<boolean>;
  canEncode: () => Promise<boolean>;
  decode: (bytes: Uint8Array, signal?: AbortSignal) => Promise<ImageBitmap>;
  encode?: (bitmap: ImageBitmap, options: EncodeOptions, signal?: AbortSignal) => Promise<Blob>;
  supportsLossless?: boolean;
}

const ascii = (bytes: Uint8Array, offset: number, length: number) => String.fromCharCode(...bytes.subarray(offset, offset + length));
export function sniffFormat(bytes: Uint8Array): ImageFormat | null {
  if (bytes.length >= 8 && ascii(bytes, 0, 8) === '\x89PNG\r\n\x1a\n') return 'png';
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpeg';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  if (ascii(bytes, 0, 6) === 'GIF87a' || ascii(bytes, 0, 6) === 'GIF89a') return 'gif';
  if (ascii(bytes, 0, 2) === 'BM') return 'bmp';
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') {
    const brand = ascii(bytes, 8, 4);
    if (['avif', 'avis'].includes(brand)) return 'avif';
    if (['heic', 'heix', 'hevc', 'mif1', 'msf1'].includes(brand)) return 'heic';
  }
  if (bytes.length >= 2 && ((bytes[0] === 255 && bytes[1] === 10) || ascii(bytes, 0, 12) === '\0\0\0\x0cJXL \r\n\x87\n')) return 'jxl';
  if (bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) return 'ico';
  const start = new TextDecoder().decode(bytes.subarray(0, 512)).replace(/^\uFEFF?\s*(?:<\?xml[^>]*>\s*)?/, '');
  if (/^<svg(?:\s|>)/i.test(start)) return 'svg';
  return null;
}

const mime: Record<ImageFormat, string> = {
  png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', jxl: 'image/jxl',
  gif: 'image/gif', bmp: 'image/bmp', svg: 'image/svg+xml', heic: 'image/heic', ico: 'image/x-icon',
};
const extensions: Record<ImageFormat, string[]> = {
  png: ['png'], jpeg: ['jpg', 'jpeg'], webp: ['webp'], avif: ['avif'], jxl: ['jxl'],
  gif: ['gif'], bmp: ['bmp'], svg: ['svg'], heic: ['heic', 'heif'], ico: ['ico'],
};
const nativeDecode = new Set<ImageFormat>(['png', 'jpeg', 'webp', 'gif', 'bmp', 'avif', 'svg', 'jxl', 'heic']);
const nativeEncode = new Set<ImageFormat>(['png', 'jpeg', 'webp', 'avif', 'jxl']);
const probeCache = new Map<ImageFormat, Promise<boolean>>();

function canvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (width > 16384 || height > 16384) throw new Error('Canvas side exceeds 16384 px limit');
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  const element = document.createElement('canvas');
  element.width = width; element.height = height;
  return element;
}
export async function canvasBlob(source: OffscreenCanvas | HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  if ('convertToBlob' in source) return source.convertToBlob({ type, quality });
  return new Promise((resolve, reject) => source.toBlob(blob => blob ? resolve(blob) : reject(new Error(`Cannot encode ${type}`)), type, quality));
}
export async function nativeEncodeBitmap(bitmap: ImageBitmap, format: ImageFormat, options: EncodeOptions = {}, signal?: AbortSignal): Promise<Blob> {
  signal?.throwIfAborted();
  const surface = canvas(bitmap.width, bitmap.height);
  const context = surface.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!context) throw new Error('Canvas is unavailable');
  context.drawImage(bitmap, 0, 0);
  const blob = await canvasBlob(surface, mime[format], format === 'png' || options.lossless ? 1 : Math.min(1, Math.max(0.01, (options.quality ?? 82) / 100)));
  signal?.throwIfAborted();
  if (blob.type !== mime[format]) throw new Error(`Cannot encode ${format}; this browser has no encoder and no vendored one`);
  return blob;
}
async function browserDecode(bytes: Uint8Array, format: ImageFormat, signal?: AbortSignal): Promise<ImageBitmap> {
  signal?.throwIfAborted();
  const blob = new Blob([bytes as BlobPart], { type: mime[format] });
  if (format === 'svg') {
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      signal?.throwIfAborted();
      const text = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 4096)));
      const root = text.match(/<svg\b[^>]*>/i)?.[0] ?? '';
      const specifiedWidth = Number(root.match(/\bwidth=["']([\d.]+)/i)?.[1]);
      const specifiedHeight = Number(root.match(/\bheight=["']([\d.]+)/i)?.[1]);
      const viewBox = root.match(/\bviewBox=["'][\d.\s-]+\s([\d.]+)\s([\d.]+)/i);
      const width = Math.round(specifiedWidth || 1024);
      const height = Math.round(specifiedHeight || (viewBox ? width * Number(viewBox[2]) / Number(viewBox[1]) : img.naturalHeight * width / img.naturalWidth || 1024));
      const surface = canvas(width, height);
      const context = surface.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
      context?.drawImage(img, 0, 0, width, height);
      return await createImageBitmap(surface);
    } finally { URL.revokeObjectURL(url); }
  }
  return createImageBitmap(blob, { imageOrientation: 'from-image' });
}
function probe(format: ImageFormat): Promise<boolean> {
  if (!nativeEncode.has(format)) return Promise.resolve(false);
  if (!probeCache.has(format)) probeCache.set(format, (async () => {
    if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') return false;
    try {
      const surface = canvas(1, 1);
      surface.getContext('2d');
      const blob = await canvasBlob(surface, mime[format], 0.82);
      return blob.type === mime[format];
    } catch { return false; }
  })());
  return probeCache.get(format)!;
}
const vendor = () => import('./vendor-codecs');
async function canDecode(format: ImageFormat): Promise<boolean> {
  if (format === 'jxl' || format === 'heic') return (await vendor()).vendorAvailable(format, 'decode');
  return nativeDecode.has(format);
}
async function canEncode(format: ImageFormat): Promise<boolean> {
  if (await probe(format)) return true;
  if (['png', 'jpeg', 'webp', 'avif', 'jxl'].includes(format)) return (await vendor()).vendorAvailable(format, 'encode');
  return false;
}
async function decode(bytes: Uint8Array, format: ImageFormat, signal?: AbortSignal): Promise<ImageBitmap> {
  if (nativeDecode.has(format)) {
    try { return await browserDecode(bytes, format, signal); }
    catch (error) {
      if (signal?.aborted || !['png', 'jpeg', 'webp', 'avif', 'jxl', 'heic'].includes(format)) throw error;
    }
  }
  if (['png', 'jpeg', 'webp', 'avif', 'jxl', 'heic'].includes(format)) return (await vendor()).decodeVendor(bytes, format as 'png' | 'jpeg' | 'webp' | 'avif' | 'jxl' | 'heic', signal);
  throw new Error(`Cannot decode ${format}; this browser has no decoder and no vendored one`);
}
async function encode(bitmap: ImageBitmap, format: ImageFormat, options: EncodeOptions, signal?: AbortSignal): Promise<Blob> {
  if (!options.lossless || format === 'png' || format === 'jpeg') {
    if (await probe(format)) {
      try { return await nativeEncodeBitmap(bitmap, format, options, signal); }
      catch (error) { if (signal?.aborted) throw error; }
    }
  }
  if (['png', 'jpeg', 'webp', 'avif', 'jxl'].includes(format)) return (await vendor()).encodeVendor(bitmap, format as 'png' | 'jpeg' | 'webp' | 'avif' | 'jxl', options, signal);
  throw new Error(`Cannot encode ${format}; this browser has no encoder and no vendored one`);
}
const formats = Object.keys(mime) as ImageFormat[];
const codecs = Object.fromEntries(formats.map(format => [format, {
  format, mimeType: mime[format], extensions: extensions[format],
  canDecode: () => canDecode(format), canEncode: () => canEncode(format),
  decode: (bytes: Uint8Array, signal?: AbortSignal) => decode(bytes, format, signal),
  ...nativeEncode.has(format) ? { encode: (bitmap: ImageBitmap, options: EncodeOptions, signal?: AbortSignal) => encode(bitmap, format, options, signal) } : {},
  supportsLossless: ['webp', 'avif', 'jxl'].includes(format),
}])) as Record<ImageFormat, Codec>;

export const EXPORT_FORMATS: ImageFormat[] = ['png', 'jpeg', 'webp', 'avif', 'jxl'];
export function getCodec(format: ImageFormat): Codec { return codecs[format]; }
