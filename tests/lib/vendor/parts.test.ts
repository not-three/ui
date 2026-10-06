import { afterEach, expect, it, vi } from 'vitest';
import { fetchVendorBytes, VENDOR_FETCH_SNIPPET } from '~/lib/vendor/parts';

const body = (bytes: number[]) => new Response(new Uint8Array(bytes), { headers: { 'content-length': String(bytes.length) } });
afterEach(() => vi.unstubAllGlobals());

it('reassembles split parts in order and reports running progress', async () => {
  const manifest = { size: 5, parts: [{ name: 'file.bin.part0', size: 3 }, { name: 'file.bin.part1', size: 2 }] };
  const fetcher = vi.fn(async (url: string) => {
    if (url.endsWith('.parts.json')) return new Response(JSON.stringify(manifest));
    if (url.endsWith('part0')) return body([1, 2, 3]);
    if (url.endsWith('part1')) return body([4, 5]);
    return new Response(null, { status: 404 });
  });
  vi.stubGlobal('fetch', fetcher);
  const progress: [number, number][] = [];
  const bytes = await fetchVendorBytes('/vendor/x/file.bin', { onProgress: (loaded, total) => progress.push([loaded, total]) });
  expect([...bytes]).toEqual([1, 2, 3, 4, 5]);
  expect(progress.at(-1)).toEqual([5, 5]);
  expect(fetcher.mock.calls.map(call => call[0])).toEqual(['/vendor/x/file.bin.parts.json', '/vendor/x/file.bin.part0', '/vendor/x/file.bin.part1']);
});

it('falls back to the plain file when there is no manifest and enforces the size limit', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => url.endsWith('.parts.json') ? new Response(null, { status: 404 }) : body([9, 8])));
  expect([...await fetchVendorBytes('/vendor/x/plain.bin')]).toEqual([9, 8]);
  await expect(fetchVendorBytes('/vendor/x/plain.bin', { maxBytes: 1 })).rejects.toThrow(/exceeds 1 bytes/);
});

it('rejects an inconsistent manifest', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ size: 3, parts: [{ name: 'a.part0', size: 2 }] }))));
  await expect(fetchVendorBytes('/vendor/x/a')).rejects.toThrow(/inconsistent/);
});

it('ships an iframe snippet that behaves like the module function', async () => {
  const manifest = { size: 4, parts: [{ name: 'r.wasm.part0', size: 2 }, { name: 'r.wasm.part1', size: 2 }] };
  const fetcher = vi.fn(async (url: string) => {
    if (url.endsWith('.parts.json')) return new Response(JSON.stringify(manifest));
    if (url.endsWith('part0')) return new Response(new Uint8Array([1, 2]));
    if (url.endsWith('part1')) return new Response(new Uint8Array([3, 4]));
    return new Response(null, { status: 404 });
  });
  const fn = new Function('fetch', `${VENDOR_FETCH_SNIPPET}; return fetchVendorBytes;`)(fetcher) as (url: string) => Promise<Uint8Array>;
  expect([...await fn('/vendor/ruby-wasm/r.wasm')]).toEqual([1, 2, 3, 4]);
});
