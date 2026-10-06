// JPEG XL SizeHeader is bit-packed, least-significant bit first. Only its
// dimensions are needed here; the codec validates the remaining codestream.
const signature = [0, 0, 0, 12, 74, 88, 76, 32, 13, 10, 135, 10];
const aspectRatios: Array<[number, number]> = [[0, 0], [1, 1], [12, 10], [4, 3], [3, 2], [16, 9], [5, 4], [2, 1]];

function sizeHeader(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 2 || bytes[0] !== 255 || bytes[1] !== 10) return null;
  let bit = 16;
  function read(count: number): number | null {
    if (bit + count > bytes.length * 8) return null;
    let value = 0;
    for (let i = 0; i < count; i++, bit++) value += ((bytes[bit >> 3]! >> (bit & 7)) & 1) * 2 ** i;
    return value;
  }
  function dimension(): number | null {
    const selector = read(2);
    if (selector === null) return null;
    const value = read([9, 13, 18, 30][selector]!);
    return value === null ? null : value + 1;
  }
  const small = read(1);
  if (small === null) return null;
  const y = small ? read(5) : dimension();
  if (y === null) return null;
  const height = small ? (y + 1) * 8 : y;
  const ratio = read(3);
  if (ratio === null) return null;
  const x = ratio ? null : small ? read(5) : dimension();
  if (!ratio && x === null) return null;
  const width = ratio ? Math.floor(height * aspectRatios[ratio]![0] / aspectRatios[ratio]![1]) : small ? (x! + 1) * 8 : x!;
  return width > 0 && height > 0 ? { width, height } : null;
}

function boxType(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
}

export function readJxlDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes[0] === 255 && bytes[1] === 10) return sizeHeader(bytes);
  if (bytes.length < signature.length || !signature.every((value, index) => bytes[index] === value)) return null;

  const prefix = new Uint8Array(11); // marker plus the longest SizeHeader (70 bits)
  let used = 0;
  let nextPart = 0;
  for (let offset = signature.length; offset < bytes.length;) {
    if (offset + 8 > bytes.length) return null;
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset);
    const declared = view.getUint32(0);
    const headerSize = declared === 1 ? 16 : 8;
    if (offset + headerSize > bytes.length) return null;
    const size = declared === 0 ? bytes.length - offset : declared === 1
      ? view.getUint32(8) * 0x100000000 + view.getUint32(12) : declared;
    if (!Number.isSafeInteger(size) || size < headerSize || size > bytes.length - offset) return null;
    const type = boxType(bytes, offset);
    let payload = offset + headerSize;
    if (type === 'jxlc' || type === 'jxlp') {
      if (type === 'jxlp') {
        if (size - headerSize < 4 || (view.getUint32(headerSize) & 0x7fffffff) !== nextPart++) return null;
        payload += 4;
      } else if (nextPart !== 0) return null;
      const count = Math.min(prefix.length - used, offset + size - payload);
      prefix.set(bytes.subarray(payload, payload + count), used);
      used += count;
      const dimensions = sizeHeader(prefix.subarray(0, used));
      if (dimensions) return dimensions;
    }
    offset += size;
  }
  return null;
}
