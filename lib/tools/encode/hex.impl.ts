import type { ToolRun } from '../types';
export const run: ToolRun = async (inputs, options, context) => {
  const input = inputs.input;
  if (!input) throw new Error('Input is required');
  const bytes = input.kind === 'text' ? new TextEncoder().encode(input.text) : new Uint8Array(await new Response(input.stream).arrayBuffer());
  if (context.signal.aborted) throw new DOMException('Aborted', 'AbortError');
  if (options.mode === 'decode') {
    const hex = new TextDecoder('utf-8', { fatal: true }).decode(bytes).trim();
    if (hex.length % 2 || !/^[a-fA-F0-9]*$/.test(hex)) throw new Error('Invalid hexadecimal input');
    return { kind: 'bytes', bytes: Uint8Array.from(hex.match(/.{2}/g) ?? [], pair => parseInt(pair, 16)), filename: 'decoded.bin' };
  }
  return { kind: 'text', text: Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(''), language: 'plaintext' };
};
