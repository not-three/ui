import type { ToolProgressDetail } from '../types';
import { MODEL_BYTES, MODEL_FETCH_PROGRESS_END, MODEL_URL } from '../../image/background-model';
export { MODEL_BYTES, MODEL_FETCH_PROGRESS_END, MODEL_URL } from '../../image/background-model';
export function createModelLoader(url: string, expectedBytes: number) {
  let cachedModel: Uint8Array | null = null;
  return async (signal: AbortSignal, reportProgress: (fraction: number, detail?: ToolProgressDetail) => void): Promise<Uint8Array> => {
  if (cachedModel) { reportProgress(MODEL_FETCH_PROGRESS_END, { phase: 'processing' }); return cachedModel; }
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`Model download failed (${response.status})`);
  const total = Number(response.headers.get('content-length')) || expectedBytes;
  if (total > 90_000_000) throw new Error('Background model exceeds 90 MB limit');
  if (!response.body) throw new Error('Model download has no response body');
  const chunks: Uint8Array[] = [];
  let received = 0;
  const reader = response.body.getReader();
  try {
    while (true) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > 90_000_000) throw new Error('Background model exceeds 90 MB limit');
      chunks.push(value);
      reportProgress(Math.min(MODEL_FETCH_PROGRESS_END, MODEL_FETCH_PROGRESS_END * received / total), { phase: 'download', loadedBytes: received, totalBytes: total });
    }
  } finally { reader.releaseLock(); }
  signal.throwIfAborted();
  if (received !== expectedBytes) throw new Error(`Background model size mismatch: ${received} bytes`);
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  cachedModel = bytes;
  reportProgress(MODEL_FETCH_PROGRESS_END, { phase: 'processing' });
  return bytes;
  };
}

export const downloadModel = createModelLoader(MODEL_URL, MODEL_BYTES);
