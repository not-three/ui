import type { ToolRun } from '../types';

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length + 12);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(new TextEncoder().encode(type), 4);
  out.set(data, 8);
  let crc = 0xffffffff;
  for (const byte of out.subarray(4, 8 + data.length)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  view.setUint32(out.length - 4, (crc ^ 0xffffffff) >>> 0);
  return out;
}

export const run: ToolRun = async (inputs, options) => {
  const input = inputs.input;
  if (!input || input.kind !== 'text' || !input.text) throw new Error('QR text is required');
  const width = Number(options.width ?? 256);
  const margin = Number(options.margin ?? 4);
  const errorCorrectionLevel = String(options.errorCorrection ?? 'M');
  if (!Number.isInteger(width) || width < 64 || width > 2048 || !Number.isInteger(margin) || margin < 0 || margin > 16) throw new Error('Invalid QR size or margin');
  if (!['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel)) throw new Error('Invalid error correction level');
  const QRCode = await import('qrcode');
  const qr = QRCode.create(input.text, { errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H' });
  const cells = qr.modules.size + margin * 2;
  const raw = new Uint8Array(width * (width + 1));
  for (let y = 0; y < width; y++) {
    const row = y * (width + 1);
    const cellY = Math.floor(y * cells / width) - margin;
    for (let x = 0; x < width; x++) {
      const cellX = Math.floor(x * cells / width) - margin;
      raw[row + x + 1] = cellX >= 0 && cellY >= 0 && cellX < qr.modules.size && cellY < qr.modules.size && qr.modules.get(cellX, cellY) ? 0 : 255;
    }
  }
  const stream = new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'));
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width); view.setUint32(4, width); header[8] = 8; header[9] = 0;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', compressed), chunk('IEND', new Uint8Array())];
  const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  return { kind: 'bytes', bytes, filename: 'qr.png', mimeType: 'image/png' };
};
