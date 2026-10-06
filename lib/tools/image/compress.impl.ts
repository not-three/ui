import type { ToolRun } from '../types';
import { getCodec, type ImageFormat } from '../../image/codecs';
import { requireImage, stem } from './shared';

export async function searchCompression(target: number, encode: (quality: number) => Promise<Blob>, signal: AbortSignal) {
  if (!Number.isFinite(target) || target <= 0) throw new Error('Target size must be positive');
  let iterations = 0;
  const attempt = async (quality: number) => { signal.throwIfAborted(); const blob = await encode(quality); signal.throwIfAborted(); iterations++; return blob; };
  let best = await attempt(1);
  if (best.size > target) return { blob: best, quality: 1, metTarget: false, iterations };
  const full = await attempt(100);
  if (full.size <= target) return { blob: full, quality: 100, metTarget: true, iterations };
  let low = 1, high = 100, quality = 1;
  while (low + 1 < high && iterations < 8) {
    const mid = Math.floor((low + high) / 2);
    const blob = await attempt(mid);
    if (blob.size <= target) { low = mid; quality = mid; best = blob; }
    else high = mid;
  }
  return { blob: best, quality, metTarget: true, iterations };
}
export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  let format: ImageFormat = context.imageExportFormat ?? 'webp';
  if (!context.imageExportFormat && !await getCodec(format).canEncode()) {
    for (const candidate of ['png','jpeg','avif','jxl'] as ImageFormat[]) {
      if (await getCodec(candidate).canEncode()) { format = candidate; break; }
    }
  }
  const codec = getCodec(format);
  if (!codec.encode || !await codec.canEncode()) throw new Error(`Cannot encode ${format}; this browser has no encoder and no vendored one`);
  const encode = (quality: number) => codec.encode!(image.bitmap, { quality }, context.signal);
  const targetMode = options.target === 'max-size';
  const target = Number(options.maxSize ?? 100) * (options.unit === 'MB' ? 1048576 : 1024);
  const result = targetMode ? await searchCompression(target, encode, context.signal) : {
    blob: await encode(Math.max(1, Math.min(100, Number(options.quality ?? 82)))), quality: Math.max(1, Math.min(100, Number(options.quality ?? 82))), metTarget: true, iterations: 1,
  };
  context.signal.throwIfAborted();
  const size = result.blob.size < 1048576 ? `${Math.round(result.blob.size / 1024)} KB` : `${(result.blob.size / 1048576).toFixed(1)} MB`;
  const message = `${result.quality} % → ${size}, ${result.iterations} iterations${result.metTarget ? '' : `; minimum achievable size is ${size}`}`;
  return { kind: 'multi', parts: [
    { label: 'Compressed image', output: { kind: 'image', blob: result.blob, width: image.width, height: image.height, filename: `${stem(image.name)}-compress.${codec.extensions[0]}`, encodedQuality: result.quality } },
    { label: 'Compression', output: { kind: 'text', text: message, language: 'plaintext' } },
  ] };
};
