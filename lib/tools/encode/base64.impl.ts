import type { ToolRun } from '../types';

export const run: ToolRun = async (inputs, options, context) => {
  const input = inputs.input;
  if (!input) throw new Error('Input is required');
  if (input.kind === 'image') throw new Error('Text or bytes required');
  const bytes = input.kind === 'text' ? new TextEncoder().encode(input.text) : new Uint8Array(await new Response(input.stream).arrayBuffer());
  if (context.signal.aborted) throw new DOMException('Aborted', 'AbortError');
  if (options.mode === 'decode') {
    const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes).trim();
    const normalized = options.urlSafe ? source.replace(/-/g, '+').replace(/_/g, '/') : source;
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==?|[A-Za-z0-9+/]{3}=?)?$/.test(normalized) || normalized.length % 4 === 1) throw new Error('Invalid Base64 input');
    try {
      const raw = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
      const decoded = Uint8Array.from(raw, char => char.charCodeAt(0));
      let text: string | undefined;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(decoded); } catch { /* Binary output remains downloadable. */ }
      return { kind: 'bytes', bytes: decoded, text, filename: 'decoded.bin' };
    } catch { throw new Error('Invalid Base64 input'); }
  }
  let raw = '';
  for (let i = 0; i < bytes.length; i += 8192) raw += String.fromCharCode(...bytes.subarray(i, i + 8192));
  const encoded = btoa(raw);
  return { kind: 'text', text: options.urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded, language: 'plaintext' };
};
