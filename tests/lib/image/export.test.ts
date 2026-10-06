import { expect, it, vi } from 'vitest';
import { createImageExport } from '../../../lib/image/export';

it('re-encodes the result and never calls the tool run', async () => {
  const result = new Blob(['result'], { type: 'image/png' });
  const input = new Blob(['input'], { type: 'image/png' });
  const encode = vi.fn(async (source: Blob) => new Blob([await source.text(), 'encoded'], { type: 'image/webp' }));
  const run = vi.fn();
  const exportJob = createImageExport(result, 2, 3, encode);
  const output = await exportJob.encode('webp', { quality: 82 });
  expect(await output.text()).toBe('resultencoded');
  expect(encode).toHaveBeenCalledWith(result, 2, 3, 'webp', { quality: 82 }, expect.any(AbortSignal));
  expect(encode).not.toHaveBeenCalledWith(input, expect.anything());
  expect(run).not.toHaveBeenCalled();
  exportJob.dispose();
});

it('aborts stale export encodes', async () => {
  let finish!: (blob: Blob) => void;
  const encode = vi.fn(async () => new Promise<Blob>(resolve => { finish = resolve; }));
  const job = createImageExport(new Blob(['result']), 1, 1, encode);
  const first = job.encode('webp', { quality: 10 });
  const second = job.encode('webp', { quality: 90 });
  finish(new Blob(['new']));
  await expect(first).rejects.toMatchObject({ name: 'AbortError' });
  await expect(second).resolves.toBeInstanceOf(Blob);
  job.dispose();
});
