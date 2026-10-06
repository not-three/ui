import { beforeEach, expect, test, vi } from 'vitest';
import { solidBitmap } from '../../image/testing';
import type { ToolInput } from '../types';

const release = vi.fn(async () => {});
const runSession = vi.fn(async () => ({ output_image: { data: new Float32Array(1024 * 1024).map((_, i) => i % 1024 < 512 ? 0.1 : 0.9), dims: [1, 1, 1024, 1024] } }));
const create = vi.fn(async () => ({ run: runSession, release }));
const downloadModel = vi.fn(async (_signal: AbortSignal, reportProgress: (fraction: number) => void) => { reportProgress(0.3); return new Uint8Array([1, 2, 3]); });
vi.mock('./background-model.impl', () => ({ downloadModel }));
vi.mock('../../image/ort-loader', () => ({
  loadOrt: async () => ({
    env: { wasm: {} }, Tensor: class { constructor(public type: string, public data: Float32Array, public dims: number[]) {} },
    InferenceSession: { create },
  }),
}));

beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); });

test('runs twice using one model fetch and releases sessions on abort', async () => {
  const { run } = await import('./remove-background.impl');
  const input: ToolInput = { kind: 'image', bitmap: solidBitmap(2, 1, [255, 0, 0, 255]), width: 2, height: 1, bytes: new Uint8Array(), mimeType: 'image/png', name: 'sample.png' };
  const first = new AbortController();
  const progress: number[] = [];
  const output = await run({ input }, { feather: 0 }, { signal: first.signal, reportProgress: value => progress.push(value) });
  expect(output).toMatchObject({ kind: 'image', width: 2, height: 1, filename: 'sample-remove-background.png' });
  expect(downloadModel).toHaveBeenCalledTimes(1);
  expect(progress.some(value => value > 0 && value < 1)).toBe(true);
  first.abort();
  expect(release).toHaveBeenCalledTimes(1);
  const second = new AbortController();
  await run({ input }, { feather: 0 }, { signal: second.signal, reportProgress: () => {} });
  expect(downloadModel).toHaveBeenCalledTimes(2);
  second.abort();
  expect(release).toHaveBeenCalledTimes(2);
});

test('does not create a session when fetch is cancelled', async () => {
  const controller = new AbortController();
  downloadModel.mockImplementationOnce(signal => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  }));
  const { run } = await import('./remove-background.impl');
  const input: ToolInput = { kind: 'image', bitmap: solidBitmap(1, 1, [255, 0, 0, 255]), width: 1, height: 1, bytes: new Uint8Array(), mimeType: 'image/png' };
  const pending = run({ input }, {}, { signal: controller.signal, reportProgress: () => {} });
  controller.abort();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(create).not.toHaveBeenCalled();
});
