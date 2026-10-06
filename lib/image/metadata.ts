import { sniffFormat, type ImageFormat } from './codecs';

const ascii = (b: Uint8Array, p: number, n: number) => String.fromCharCode(...b.subarray(p, p + n));
const be16 = (b: Uint8Array, p: number) => b[p]! * 256 + b[p + 1]!;
const be32 = (b: Uint8Array, p: number) => (b[p]! * 0x1000000 + (b[p + 1]! << 16) + (b[p + 2]! << 8) + b[p + 3]!) >>> 0;
const le32 = (b: Uint8Array, p: number) => (b[p]! | b[p + 1]! << 8 | b[p + 2]! << 16 | b[p + 3]! << 24) >>> 0;
const names: Record<number, string> = { 0x0100:'ImageWidth', 0x0101:'ImageHeight', 0x010f:'Make', 0x0110:'Model', 0x0112:'Orientation', 0x0131:'Software', 0x0132:'DateTime', 0x829a:'ExposureTime', 0x829d:'FNumber', 0x8827:'ISO', 0x9003:'DateTimeOriginal', 0x920a:'FocalLength', 0xa002:'PixelXDimension', 0xa003:'PixelYDimension', 0xa434:'LensModel' };
const gpsNames: Record<number, string> = { 1:'LatitudeRef', 2:'Latitude', 3:'LongitudeRef', 4:'Longitude', 5:'AltitudeRef', 6:'Altitude' };
export interface ExifData { tags: Record<string, unknown>; orientation: number; gps?: { latitude: number; longitude: number } }

function payload(bytes: Uint8Array): Uint8Array | null {
  const format = sniffFormat(bytes);
  if (format === 'jpeg') {
    for (let p = 2; p + 4 <= bytes.length;) {
      if (bytes[p] !== 255) break;
      const marker = bytes[p + 1]!;
      if (marker === 0xda || marker === 0xd9) break;
      const size = be16(bytes, p + 2);
      if (size < 2 || p + 2 + size > bytes.length) break;
      if (marker === 0xe1 && ascii(bytes, p + 4, 6) === 'Exif\0\0') return bytes.subarray(p + 10, p + 2 + size);
      p += 2 + size;
    }
  } else if (format === 'png') {
    for (let p = 8; p + 12 <= bytes.length;) {
      const size = be32(bytes, p); if (size > bytes.length - p - 12) break;
      if (ascii(bytes, p + 4, 4) === 'eXIf') return bytes.subarray(p + 8, p + 8 + size);
      p += size + 12;
    }
  } else if (format === 'webp') {
    for (let p = 12; p + 8 <= bytes.length;) {
      const size = le32(bytes, p + 4); if (size > bytes.length - p - 8) break;
      if (ascii(bytes, p, 4) === 'EXIF') {
        const value = bytes.subarray(p + 8, p + 8 + size);
        return ascii(value, 0, 6) === 'Exif\0\0' ? value.subarray(6) : value;
      }
      p += size + 8 + (size & 1);
    }
  }
  return null;
}

export function readExif(bytes: Uint8Array): ExifData {
  const tags: Record<string, unknown> = {};
  const result: ExifData = { tags, orientation: 1 };
  const tiff = payload(bytes);
  if (!tiff || tiff.length < 8) return result;
  const little = ascii(tiff, 0, 2) === 'II';
  if (!little && ascii(tiff, 0, 2) !== 'MM') return result;
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const u16 = (p: number) => view.getUint16(p, little);
  const u32 = (p: number) => view.getUint32(p, little);
  if (u16(2) !== 42) return result;
  const gps: Record<string, unknown> = {};
  const seen = new Set<number>();
  function ifd(offset: number, group: 'main'|'exif'|'gps', depth: number) {
    if (depth > 3 || seen.has(offset) || offset < 8 || offset + 2 > tiff!.length) return;
    seen.add(offset);
    for (let i = 0, count = Math.min(u16(offset), 1024); i < count; i++) {
      const p = offset + 2 + i * 12;
      if (p + 12 > tiff!.length) break;
      const tag = u16(p), type = u16(p + 2), quantity = u32(p + 4);
      const width = ({ 1:1, 2:1, 3:2, 4:4, 5:8, 7:1, 9:4, 10:8 } as Record<number,number>)[type];
      if (!width || quantity > 65536 || quantity * width > tiff!.length) continue;
      const length = quantity * width;
      const at = length <= 4 ? p + 8 : u32(p + 8);
      if (at > tiff!.length - length) continue;
      if (group === 'main' && (tag === 0x8769 || tag === 0x8825) && type === 4 && quantity === 1) {
        ifd(u32(at), tag === 0x8769 ? 'exif' : 'gps', depth + 1); continue;
      }
      const values: number[] = [];
      for (let j = 0; j < Math.min(quantity, 64); j++) {
        const q = at + j * width;
        if (type === 1 || type === 7) values.push(tiff![q]!);
        else if (type === 3) values.push(u16(q));
        else if (type === 4) values.push(u32(q));
        else if (type === 9) values.push(view.getInt32(q, little));
        else if (type === 5 || type === 10) {
          const n = type === 5 ? u32(q) : view.getInt32(q, little);
          const d = type === 5 ? u32(q + 4) : view.getInt32(q + 4, little);
          values.push(d ? n / d : 0);
        }
      }
      const value: unknown = type === 2 ? ascii(tiff!, at, length).replace(/\0+$/, '') : values.length === 1 ? values[0] : values;
      const name = (group === 'gps' ? gpsNames : names)[tag] ?? `0x${tag.toString(16).padStart(4, '0')}`;
      if (group === 'gps') gps[name] = value; else tags[name] = value;
    }
  }
  ifd(u32(4), 'main', 0);
  const degrees = (value: unknown) => Array.isArray(value) && value.length >= 3 && value.slice(0,3).every(n => typeof n === 'number') ? value[0] + value[1] / 60 + value[2] / 3600 : null;
  const lat = degrees(gps.Latitude), lon = degrees(gps.Longitude);
  if (lat !== null && lon !== null && ['N','S'].includes(String(gps.LatitudeRef)) && ['E','W'].includes(String(gps.LongitudeRef))) result.gps = { latitude: gps.LatitudeRef === 'S' ? -lat : lat, longitude: gps.LongitudeRef === 'W' ? -lon : lon };
  result.orientation = typeof tags.Orientation === 'number' && tags.Orientation >= 1 && tags.Orientation <= 8 ? tags.Orientation : 1;
  if (Object.keys(gps).length) tags.GPS = gps;
  return result;
}

function join(parts: Uint8Array[]) {
  const output = new Uint8Array(parts.reduce((n, item) => n + item.length, 0));
  let p = 0; for (const part of parts) { output.set(part, p); p += part.length; }
  return output;
}
export function stripMetadata(bytes: Uint8Array, format: ImageFormat): Uint8Array {
  if (format === 'jpeg') {
    const parts = [bytes.subarray(0, 2)];
    for (let p = 2; p < bytes.length;) {
      if (bytes[p] !== 255 || p + 2 > bytes.length) { parts.push(bytes.subarray(p)); break; }
      const marker = bytes[p + 1]!;
      if (marker === 0xda || marker === 0xd9) { parts.push(bytes.subarray(p)); break; }
      if (p + 4 > bytes.length) { parts.push(bytes.subarray(p)); break; }
      const size = be16(bytes, p + 2);
      if (size < 2 || p + 2 + size > bytes.length) { parts.push(bytes.subarray(p)); break; }
      if (!((marker >= 0xe1 && marker <= 0xed) || marker === 0xef || marker === 0xfe)) parts.push(bytes.subarray(p, p + 2 + size));
      p += 2 + size;
    }
    return join(parts);
  }
  if (format === 'png') {
    const parts = [bytes.subarray(0,8)];
    const requiredAncillary = new Set(['tRNS','acTL','fcTL','fdAT']);
    for (let p = 8; p + 12 <= bytes.length;) {
      const size = be32(bytes,p); if (size > bytes.length-p-12) { parts.push(bytes.subarray(p)); break; }
      const type = ascii(bytes,p+4,4);
      if (!(type.charCodeAt(0) & 0x20) || requiredAncillary.has(type)) parts.push(bytes.subarray(p,p+size+12));
      p += size+12;
    }
    return join(parts);
  }
  if (format === 'webp') {
    const parts = [bytes.subarray(0,12)];
    for (let p = 12; p + 8 <= bytes.length;) {
      const size = le32(bytes,p+4); if (size > bytes.length-p-8) { parts.push(bytes.subarray(p)); break; }
      const type = ascii(bytes,p,4);
      if (!['EXIF','XMP ','ICCP'].includes(type)) {
        const part = bytes.slice(p,p+8+size+(size&1));
        if (type === 'VP8X' && size >= 1) part[8] = part[8]! & ~0x2c;
        parts.push(part);
      }
      p += size+8+(size&1);
    }
    const output = join(parts), size = output.length-8;
    output.set([size&255,size>>>8&255,size>>>16&255,size>>>24&255],4);
    return output;
  }
  return bytes;
}
