import { expect, test, vi } from 'vitest';
import { createModelLoader } from './background-model.impl';

test('fetches once on demand, maps bytes to progress, and caches successful bytes', async () => {
  const fetcher = vi.fn(async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array([1, 2])); controller.enqueue(new Uint8Array([3, 4])); controller.close(); },
  }), { headers: { 'content-length': '4' } }));
  vi.stubGlobal('fetch', fetcher);
  const loader = createModelLoader('/vendor/image/model.onnx', 4);
  expect(fetcher).not.toHaveBeenCalled();
  const progress: number[] = [];
  expect([...await loader(new AbortController().signal, fraction => progress.push(fraction))]).toEqual([1, 2, 3, 4]);
  expect(progress).toEqual([0.275, 0.55]);
  await loader(new AbortController().signal, () => {});
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0]?.[0]).toBe('/vendor/image/model.onnx');
  vi.unstubAllGlobals();
});
