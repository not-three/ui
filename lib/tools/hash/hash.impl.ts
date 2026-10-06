import type { ToolRun } from '../types';

export const run: ToolRun = async (inputs, options, context) => {
  const input = inputs.input;
  if (!input) throw new Error('Input is required');
  if (input.kind === 'image') throw new Error('Text or bytes required');
  const wasm = await import('hash-wasm');
  const algorithms = {
    md5: wasm.createMD5, sha1: wasm.createSHA1, sha256: wasm.createSHA256,
    sha384: wasm.createSHA384, sha512: wasm.createSHA512,
    'sha3-256': () => wasm.createSHA3(256), blake3: wasm.createBLAKE3, crc32: wasm.createCRC32,
  };
  const algorithm = String(options.algorithm || 'sha256') as keyof typeof algorithms;
  const create = algorithms[algorithm];
  if (!create) throw new Error('Unknown hash algorithm');
  const hasher = await create();
  hasher.init();
  const stream = input.kind === 'bytes' ? input.stream : new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new TextEncoder().encode(input.text)); controller.close(); } });
  const reader = stream.getReader();
  let consumed = 0;
  try {
    while (true) {
      if (context.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const { done, value } = await reader.read();
      if (done) break;
      hasher.update(value);
      consumed += value.byteLength;
      if (input.kind === 'bytes' && input.size) context.reportProgress(Math.min(1, consumed / input.size));
    }
  } finally { reader.releaseLock(); }
  const digest = hasher.digest('binary');
  const hex = Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
  let raw = '';
  for (const byte of digest) raw += String.fromCharCode(byte);
  const compare = String(options.compareWith ?? '').trim();
  context.reportProgress(1);
  return compare
    ? { kind: 'table', columns: ['Algorithm', 'Hex', 'Base64', 'Comparison'], rows: [[algorithm, hex, btoa(raw), compare.toLowerCase() === hex ? 'Match' : 'Mismatch']] }
    : { kind: 'table', columns: ['Algorithm', 'Hex', 'Base64'], rows: [[algorithm, hex, btoa(raw)]] };
};
