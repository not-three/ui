export const MODEL_BYTES = 45_902_969;
export const MODEL_URL = '/vendor/image/isnet-general-use/model_quantized.onnx';
export const MODEL_FETCH_PROGRESS_END = 0.55;
export function createModelLoader(url: string, expectedBytes: number) {
  let cachedModel: Uint8Array | null = null;
  return async (signal: AbortSignal, reportProgress: (fraction: number) => void): Promise<Uint8Array> => {
  if (cachedModel) { reportProgress(MODEL_FETCH_PROGRESS_END); return cachedModel; }
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
      reportProgress(Math.min(MODEL_FETCH_PROGRESS_END, MODEL_FETCH_PROGRESS_END * received / total));
    }
  } finally { reader.releaseLock(); }
  signal.throwIfAborted();
  if (received !== expectedBytes) throw new Error(`Background model size mismatch: ${received} bytes`);
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  cachedModel = bytes;
  return bytes;
  };
}

export const downloadModel = createModelLoader(MODEL_URL, MODEL_BYTES);
