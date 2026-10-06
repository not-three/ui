import { getCodec, type EncodeOptions, type ImageFormat } from './codecs';
export type ImageEncoder = (blob: Blob, width: number, height: number, format: ImageFormat, options: EncodeOptions, signal: AbortSignal) => Promise<Blob>;

async function encodeResult(blob: Blob, _width: number, _height: number, format: ImageFormat, options: EncodeOptions, signal: AbortSignal): Promise<Blob> {
  signal.throwIfAborted();
  const bitmap = await createImageBitmap(blob);
  try {
    signal.throwIfAborted();
    const codec = getCodec(format);
    if (!codec.encode || !await codec.canEncode()) throw new Error(`Cannot encode ${format}; this browser has no encoder and no vendored one`);
    return await codec.encode(bitmap, options, signal);
  } finally { bitmap.close(); }
}
export function createImageExport(result: Blob, width: number, height: number, encoder: ImageEncoder = encodeResult) {
  let current: AbortController | null = null;
  async function encode(format: ImageFormat, options: EncodeOptions): Promise<Blob> {
    current?.abort();
    const own = new AbortController(); current = own;
    const abort = new Promise<never>((_resolve, reject) => {
      own.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
    const blob = await Promise.race([encoder(result, width, height, format, options, own.signal), abort]);
    own.signal.throwIfAborted();
    return blob;
  }
  return { encode, dispose: () => { current?.abort(); current = null; } };
}
