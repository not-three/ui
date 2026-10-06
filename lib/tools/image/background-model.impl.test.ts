import { expect, test, vi } from 'vitest';
import { createModelLoader } from './background-model.impl';

test('fetches once on demand, maps bytes to progress, and caches successful bytes', async () => {
  const fetcher = vi.fn(async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array([1, 2])); controller.enqueue(new Uint8Array([3, 4])); controller.close(); },
  }), { headers: { 'content-length': '4' } }));
  vi.stubGlobal('fetch', fetcher);
  const loader = createModelLoader('/vendor/image/model.onnx', 4);
  expect(fetcher).not.toHaveBeenCalled();
  const progress: { fraction: number; detail?: { phase: string; loadedBytes?: number; totalBytes?: number } }[] = [];
  expect([...await loader(new AbortController().signal, (fraction, detail) => progress.push({ fraction, detail }))]).toEqual([1, 2, 3, 4]);
  expect(progress).toEqual([
    { fraction: 0.275, detail: { phase: 'download', loadedBytes: 2, totalBytes: 4 } },
    { fraction: 0.55, detail: { phase: 'download', loadedBytes: 4, totalBytes: 4 } },
    { fraction: 0.55, detail: { phase: 'processing' } },
  ]);
  await loader(new AbortController().signal, () => {});
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0]?.[0]).toBe('/vendor/image/model.onnx');
  vi.unstubAllGlobals();
});
