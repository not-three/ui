import { fetchVendorBytes } from '../vendor/parts';

/** Where scripts/copy-sandbox-vendor.mjs puts the onnxruntime-web runtime. */
export const ORT_BASE = '/vendor/image/onnxruntime-web/';

export type OrtModule = typeof import('onnxruntime-web');

/**
 * onnxruntime-web is loaded from the vendored copy at run time rather than
 * imported through the bundler: importing it would make Vite emit its 26 MiB
 * WebAssembly binary into the app's assets, which the hosting platform
 * refuses. The binary is fetched here (reassembled from split parts when
 * needed) and handed to the runtime as a buffer, so the runtime never
 * fetches a file of its own.
 */
export async function loadOrt(options: { webgpu: boolean; signal?: AbortSignal; onProgress?: (loaded: number, total: number) => void }): Promise<OrtModule> {
  const bundle = options.webgpu ? 'ort.webgpu.min.mjs' : 'ort.wasm.min.mjs';
  const binary = options.webgpu ? 'ort-wasm-simd-threaded.asyncify.wasm' : 'ort-wasm-simd-threaded.wasm';
  const origin = typeof location !== 'undefined' ? location.origin : '';
  const ort = await import(/* @vite-ignore */ `${origin}${ORT_BASE}${bundle}`) as OrtModule;
  const bytes = await fetchVendorBytes(`${ORT_BASE}${binary}`, { signal: options.signal, onProgress: options.onProgress, maxBytes: 64 * 1024 * 1024 });
  options.signal?.throwIfAborted();
  ort.env.wasm.wasmPaths = `${origin}${ORT_BASE}`;
  ort.env.wasm.wasmBinary = bytes.buffer as ArrayBuffer;
  ort.env.wasm.numThreads = 1;
  return ort;
}
