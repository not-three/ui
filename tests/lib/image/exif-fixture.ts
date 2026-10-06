const be = (n: number) => [n >>> 8, n & 255];
const le32 = (n: number) => [n & 255, n >>> 8 & 255, n >>> 16 & 255, n >>> 24 & 255];
const ascii = (s: string) => [...new TextEncoder().encode(s)];
const entry = (tag: number, type: number, count: number, value: number) => [...be(tag).reverse(), ...be(type).reverse(), ...le32(count), ...le32(value)];
export const tiff = Uint8Array.from([
  73,73,42,0,8,0,0,0, 3,0,
  ...entry(0x0112, 3, 1, 6), ...entry(0x010f, 2, 6, 50), ...entry(0x8825, 4, 1, 56), ...le32(0),
  ...ascii('Canon\0'),
  4,0,
  ...entry(1,2,2,78), ...entry(2,5,3,110), ...entry(3,2,2,87), ...entry(4,5,3,134), ...le32(0),
  ...[51,0,0,0,1,0,0,0, 30,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0,
      7,0,0,0,1,0,0,0, 30,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0],
]);
const exif = Uint8Array.from([...ascii('Exif\0\0'), ...tiff]);
export function jpeg(payload = exif) { return Uint8Array.from([255,216,255,225,...be(payload.length + 2),...payload,255,218,0,2,1,2,3,255,217]); }
export function chunk(type: string, payload: Uint8Array) { return Uint8Array.from([...ascii(type),...le32(payload.length),...payload,...(payload.length % 2 ? [0] : [])]); }
export function webp(payload = tiff) { const body = Uint8Array.from([...chunk('EXIF',payload),...chunk('VP8 ',Uint8Array.from([1,2]))]); return Uint8Array.from([...ascii('RIFF'),...le32(body.length + 4),...ascii('WEBP'),...body]); }
export function png(payload = tiff) { return Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,payload.length,...ascii('eXIf'),...payload,0,0,0,0,0,0,0,1,...ascii('IDAT'),42,0,0,0,0]); }
