import type { ToolProgressDetail } from '../types';
import { fetchVendorBytes } from '../../vendor/parts';
import { MODEL_BYTES, MODEL_FETCH_PROGRESS_END, MODEL_URL } from '../../image/background-model';
export { MODEL_BYTES, MODEL_FETCH_PROGRESS_END, MODEL_URL } from '../../image/background-model';

const MODEL_LIMIT = 90_000_000;

export function createModelLoader(url: string, expectedBytes: number) {
  let cachedModel: Uint8Array | null = null;
  return async (signal: AbortSignal, reportProgress: (fraction: number, detail?: ToolProgressDetail) => void): Promise<Uint8Array> => {
    if (cachedModel) { reportProgress(MODEL_FETCH_PROGRESS_END, { phase: 'processing' }); return cachedModel; }
    let bytes: Uint8Array;
    try {
      bytes = await fetchVendorBytes(url, {
        signal,
        maxBytes: MODEL_LIMIT,
        onProgress: (loaded, total) => reportProgress(Math.min(MODEL_FETCH_PROGRESS_END, MODEL_FETCH_PROGRESS_END * loaded / (total || expectedBytes)), { phase: 'download', loadedBytes: loaded, totalBytes: total || expectedBytes }),
      });
    } catch (error) {
      if (error instanceof Error && /exceeds/.test(error.message)) throw new Error('Background model exceeds 90 MB limit', { cause: error });
      if (error instanceof Error && /download failed/.test(error.message)) throw new Error(`Model ${error.message}`, { cause: error });
      throw error;
    }
    signal.throwIfAborted();
    if (bytes.byteLength !== expectedBytes) throw new Error(`Background model size mismatch: ${bytes.byteLength} bytes`);
    cachedModel = bytes;
    reportProgress(MODEL_FETCH_PROGRESS_END, { phase: 'processing' });
    return bytes;
  };
}

export const downloadModel = createModelLoader(MODEL_URL, MODEL_BYTES);
