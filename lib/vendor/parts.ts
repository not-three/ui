/**
 * Vendored binaries above 20 MiB are shipped as numbered parts plus a
 * `<file>.parts.json` manifest (scripts/vendor-split.mjs), because the
 * hosting platform refuses single files above 25 MiB. This fetches such a
 * file transparently: when the manifest exists the parts are downloaded in
 * order and concatenated, otherwise the file itself is fetched. Everything
 * stays on the app's own origin.
 */
export interface VendorPartsManifest { size: number; parts: { name: string; size: number }[] }

export interface FetchVendorOptions {
  signal?: AbortSignal;
  /** Called as bytes arrive, with the running total and the final size. */
  onProgress?: (loaded: number, total: number) => void;
  /** Reject downloads whose declared size exceeds this many bytes. */
  maxBytes?: number;
}

export const MANIFEST_SUFFIX = '.parts.json';

async function readInto(response: Response, target: Uint8Array, offset: number, onChunk: (loaded: number) => void, signal?: AbortSignal): Promise<number> {
  if (!response.body) throw new Error('download has no response body');
  const reader = response.body.getReader();
  let written = 0;
  try {
    while (true) {
      signal?.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      if (offset + written + value.byteLength > target.byteLength) throw new Error('download is larger than declared');
      target.set(value, offset + written);
      written += value.byteLength;
      onChunk(written);
    }
  } finally { reader.releaseLock(); }
  return written;
}

/** Fetch a vendored file, reassembling split parts when a manifest exists. */
export async function fetchVendorBytes(url: string, options: FetchVendorOptions = {}): Promise<Uint8Array> {
  const { signal, onProgress, maxBytes } = options;
  const manifestResponse = await fetch(url + MANIFEST_SUFFIX, { signal, cache: 'no-store' });
  if (manifestResponse.ok) {
    const manifest = await manifestResponse.json() as VendorPartsManifest;
    const declared = manifest.parts.reduce((sum, part) => sum + part.size, 0);
    if (!Number.isInteger(manifest.size) || declared !== manifest.size) throw new Error('vendor manifest is inconsistent');
    if (maxBytes !== undefined && manifest.size > maxBytes) throw new Error(`download exceeds ${maxBytes} bytes`);
    const bytes = new Uint8Array(manifest.size);
    const base = url.slice(0, url.lastIndexOf('/') + 1);
    let offset = 0;
    for (const part of manifest.parts) {
      signal?.throwIfAborted();
      const response = await fetch(base + part.name, { signal, cache: 'no-store' });
      if (!response.ok) throw new Error(`download failed (${response.status})`);
      const written = await readInto(response, bytes, offset, loaded => onProgress?.(offset + loaded, manifest.size), signal);
      if (written !== part.size) throw new Error('vendor part size mismatch');
      offset += written;
    }
    return bytes;
  }
  if (manifestResponse.status !== 404) throw new Error(`download failed (${manifestResponse.status})`);
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`download failed (${response.status})`);
  const total = Number(response.headers.get('content-length')) || 0;
  if (maxBytes !== undefined && total > maxBytes) throw new Error(`download exceeds ${maxBytes} bytes`);
  if (total > 0) {
    const bytes = new Uint8Array(total);
    const written = await readInto(response, bytes, 0, loaded => onProgress?.(loaded, total), signal);
    return written === total ? bytes : bytes.subarray(0, written);
  }
  const chunks: Uint8Array[] = [];
  let received = 0;
  if (!response.body) throw new Error('download has no response body');
  const reader = response.body.getReader();
  try {
    while (true) {
      signal?.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (maxBytes !== undefined && received > maxBytes) throw new Error(`download exceeds ${maxBytes} bytes`);
      chunks.push(value);
      onProgress?.(received, received);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

/**
 * The same logic as plain JavaScript for the sandbox iframe, where runner
 * code is inlined into a document and cannot import modules. Defines
 * `fetchVendorBytes(url)` returning a Uint8Array.
 */
export const VENDOR_FETCH_SNIPPET = `
async function fetchVendorBytes(url) {
  var manifestResponse = await fetch(url + "${MANIFEST_SUFFIX}", { cache: "no-store" });
  if (manifestResponse.ok) {
    var manifest = await manifestResponse.json();
    var bytes = new Uint8Array(manifest.size);
    var base = url.slice(0, url.lastIndexOf("/") + 1);
    var offset = 0;
    for (var i = 0; i < manifest.parts.length; i++) {
      var part = await fetch(base + manifest.parts[i].name, { cache: "no-store" });
      if (!part.ok) throw new Error("download failed (" + part.status + ")");
      var chunk = new Uint8Array(await part.arrayBuffer());
      if (chunk.byteLength !== manifest.parts[i].size) throw new Error("vendor part size mismatch");
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    if (offset !== manifest.size) throw new Error("vendor manifest is inconsistent");
    return bytes;
  }
  if (manifestResponse.status !== 404) throw new Error("download failed (" + manifestResponse.status + ")");
  var response = await fetch(url);
  if (!response.ok) throw new Error("download failed (" + response.status + ")");
  return new Uint8Array(await response.arrayBuffer());
}
`;
