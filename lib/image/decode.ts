import { getCodec, sniffFormat, type ImageFormat } from './codecs';
import type { ToolInput } from '../tools/types';

export const IMAGE_BYTE_LIMIT = 256 * 1024 * 1024;
export const IMAGE_PIXEL_LIMIT = 50_000_000;
export const CANVAS_SIDE_LIMIT = 16384;
const u16 = (bytes: Uint8Array, offset: number, little = false) => little ? bytes[offset]! | bytes[offset + 1]! << 8 : bytes[offset]! << 8 | bytes[offset + 1]!;
const u32 = (bytes: Uint8Array, offset: number, little = false) => little ? (bytes[offset]! | bytes[offset + 1]! << 8 | bytes[offset + 2]! << 16 | bytes[offset + 3]! << 24) >>> 0 : (bytes[offset]! * 0x1000000 + (bytes[offset + 1]! << 16) + (bytes[offset + 2]! << 8) + bytes[offset + 3]!) >>> 0;
function gifHasMultipleFrames(bytes: Uint8Array): boolean {
  let p = 13;
  if (bytes[10]! & 0x80) p += 3 * (1 << ((bytes[10]! & 7) + 1));
  let frames = 0;
  while (p < bytes.length) {
    const marker = bytes[p]!;
    if (marker === 0x3b) break;
    if (marker === 0x2c) {
      frames++; if (frames > 1) return true;
      if (p + 10 > bytes.length) break;
      const packed = bytes[p + 9]!;
      p += 10;
      if (packed & 0x80) p += 3 * (1 << ((packed & 7) + 1));
      p++;
    } else if (marker === 0x21) p += 2;
    else break;
    while (p < bytes.length) { const size = bytes[p++]!; if (!size) break; p += size; }
  }
  return false;
}
function orientation(bytes: Uint8Array, start: number): number {
  if (String.fromCharCode(...bytes.subarray(start, start + 6)) !== 'Exif\0\0') return 1;
  const tiff = start + 6;
  const little = bytes[tiff] === 73 && bytes[tiff + 1] === 73;
  if (!little && !(bytes[tiff] === 77 && bytes[tiff + 1] === 77)) return 1;
  const ifd = tiff + u32(bytes, tiff + 4, little);
  if (ifd + 2 > bytes.length) return 1;
  for (let i = 0, count = Math.min(u16(bytes, ifd, little), 128); i < count; i++) {
    const p = ifd + 2 + i * 12;
    if (p + 12 > bytes.length) break;
    if (u16(bytes, p, little) === 274) return u16(bytes, p + 8, little);
  }
  return 1;
}
export function inspectImage(bytes: Uint8Array): { format: ImageFormat | null; width: number; height: number; orientation: number; animated: boolean } {
  const format = sniffFormat(bytes);
  let width = 0; let height = 0; let rotate = 1; let animated = false;
  if (format === 'png' && bytes.length >= 24) {
    width = u32(bytes, 16); height = u32(bytes, 20);
    for (let p = 8; p + 12 <= bytes.length;) {
      const length = u32(bytes, p);
      if (length > bytes.length - p - 12) break;
      const type = String.fromCharCode(...bytes.subarray(p + 4, p + 8));
      if (type === 'acTL' && length >= 8) { animated = u32(bytes, p + 8) > 1; break; }
      if (type === 'IDAT') break;
      p += length + 12;
    }
  }
  if (format === 'gif' && bytes.length >= 13) { width = u16(bytes, 6, true); height = u16(bytes, 8, true); animated = gifHasMultipleFrames(bytes); }
  if (format === 'bmp' && bytes.length >= 26) { width = u32(bytes, 18, true); height = Math.abs(u32(bytes, 22, true) | 0); }
  if ((format === 'avif' || format === 'heic') && bytes.length >= 32) {
    const marker = new TextEncoder().encode('ispe');
    for (let p = 4; p < Math.min(bytes.length - 12, 1024 * 1024); p++) {
      if (bytes[p] === marker[0] && bytes[p + 1] === marker[1] && bytes[p + 2] === marker[2] && bytes[p + 3] === marker[3]) {
        width = u32(bytes, p + 8); height = u32(bytes, p + 12); break;
      }
    }
  }
  if (format === 'avif' && bytes.length >= 12) animated = String.fromCharCode(...bytes.subarray(8, 12)) === 'avis';
  if (format === 'ico' && bytes.length >= 8) { width = bytes[6] || 256; height = bytes[7] || 256; }
  if (format === 'webp' && bytes.length >= 30) {
    const chunk = String.fromCharCode(...bytes.subarray(12, 16));
    if (chunk === 'VP8X') { width = 1 + (bytes[24]! | bytes[25]! << 8 | bytes[26]! << 16); height = 1 + (bytes[27]! | bytes[28]! << 8 | bytes[29]! << 16); animated = !!(bytes[20]! & 2); }
    if (chunk === 'VP8 ' && bytes.length >= 30) { width = u16(bytes, 26, true) & 0x3fff; height = u16(bytes, 28, true) & 0x3fff; }
    if (chunk === 'VP8L' && bytes.length >= 25) { width = 1 + (bytes[21]! | (bytes[22]! & 0x3f) << 8); height = 1 + ((bytes[22]! >> 6) | bytes[23]! << 2 | (bytes[24]! & 15) << 10); }
  }
  if (format === 'jpeg') {
    for (let p = 2; p < bytes.length;) {
      if (bytes[p++] !== 255) break;
      while (bytes[p] === 255) p++;
      if (p >= bytes.length) break;
      const marker = bytes[p++]!;
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || marker === 216 || (marker >= 208 && marker <= 215)) continue;
      if (p + 2 > bytes.length) break;
      const length = u16(bytes, p);
      if (length < 2 || p + length > bytes.length) break;
      if (marker === 225) rotate = orientation(bytes, p + 2);
      if ([192,193,194,195,198,199,201,202,203,205,206,207].includes(marker) && length >= 7) { height = u16(bytes, p + 3); width = u16(bytes, p + 5); }
      p += length;
    }
  }
  if (format === 'svg') {
    const text = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 4096)));
    const root = text.match(/<svg\b[^>]*>/i)?.[0] ?? '';
    const w = Number(root.match(/\bwidth=["']([\d.]+)/i)?.[1]);
    const h = Number(root.match(/\bheight=["']([\d.]+)/i)?.[1]);
    const viewBox = root.match(/\bviewBox=["'][\d.\s-]+\s([\d.]+)\s([\d.]+)/i);
    width = Math.round(w || 1024); height = Math.round(h || (viewBox ? width * Number(viewBox[2]) / Number(viewBox[1]) : 1024));
  }
  return { format, width, height, orientation: rotate, animated };
}
export function checkImageLimits(size: number, width: number, height: number) {
  if (size > IMAGE_BYTE_LIMIT) throw new Error(`Image exceeds 256 MiB limit (${(size / 1048576).toFixed(1)} MiB)`);
  if (width * height > IMAGE_PIXEL_LIMIT) throw new Error(`Image exceeds 50 MP limit (${(width * height / 1e6).toFixed(1)} MP)`);
  if (width > CANVAS_SIDE_LIMIT || height > CANVAS_SIDE_LIMIT) throw new Error('Image exceeds 16384 px canvas side limit');
}
export async function decodeImage(bytes: Uint8Array, name?: string, signal?: AbortSignal): Promise<Extract<ToolInput, { kind: 'image' }>> {
  checkImageLimits(bytes.byteLength, 0, 0);
  const info = inspectImage(bytes);
  if (!info.format) throw new Error('not an image');
  if (info.format === 'svg') {
    const text = new TextDecoder().decode(bytes);
    if (/(?:href|src)\s*=\s*["']\s*(?:https?:|\/\/)|@import\s|url\(\s*["']?\s*(?:https?:|\/\/)|<\s*(?:script|foreignObject)\b/i.test(text)) throw new Error('SVG contains external resources');
  }
  checkImageLimits(bytes.byteLength, info.width, info.height);
  const codec = getCodec(info.format);
  if (!await codec.canDecode()) {
    if (info.format !== 'heic' && info.format !== 'ico') throw new Error(`Cannot decode ${info.format}; this browser has no decoder and no vendored one`);
    const placeholder = await createImageBitmap(new ImageData(1, 1));
    return { kind: 'image', bitmap: placeholder, width: 0, height: 0, bytes, mimeType: codec.mimeType, name };
  }
  if (info.width <= 0 || info.height <= 0) throw new Error(`Cannot inspect ${info.format} dimensions before decode`);
  let bitmap: ImageBitmap;
  try {
    bitmap = await codec.decode(bytes, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(`Cannot decode ${info.format}; this browser has no decoder and no vendored one`, { cause: error });
  }
  try {
    signal?.throwIfAborted();
    checkImageLimits(bytes.byteLength, bitmap.width, bitmap.height);
    return { kind: 'image', bitmap, width: bitmap.width, height: bitmap.height, bytes, mimeType: codec.mimeType, name, firstFrameOnly: info.animated };
  } catch (error) { bitmap.close(); throw error; }
}
