import { expect, test, vi } from 'vitest';
import { createModelLoader } from './background-model.impl';

test('fetches once on demand, maps bytes to progress, and caches successful bytes', async () => {
  const fetcher = vi.fn(async (url: string) => url.endsWith('.parts.json') ? new Response(null, { status: 404 }) : new Response(new ReadableStream({
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
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls.map(call => call[0])).toEqual(['/vendor/image/model.onnx.parts.json', '/vendor/image/model.onnx']);
  vi.unstubAllGlobals();
});
