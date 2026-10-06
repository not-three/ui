import type { ToolContext, ToolInput } from '../types';

export async function readBytes(input: ToolInput | undefined, context: ToolContext, limit = 64 * 1024 * 1024): Promise<Uint8Array> {
  if (!input) throw new Error('Input is required');
  if (input.kind === 'text') return new TextEncoder().encode(input.text);
  if (input.kind !== 'bytes') throw new Error('Byte input required');
  if (input.size && input.size > limit) throw new Error('Browser cryptography is limited to 64 MiB per operation');
  const chunks: Uint8Array[] = [];
  let length = 0;
  const reader = input.stream.getReader();
  try {
    while (true) {
      if (context.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) throw new Error('Browser cryptography is limited to 64 MiB per operation');
      chunks.push(value);
      if (input.size) context.reportProgress(Math.min(0.8, length / input.size * 0.8));
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export function base64(bytes: Uint8Array): string {
  let raw = '';
  for (let i = 0; i < bytes.length; i += 8192) raw += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(raw);
}

export function unbase64(value: string): Uint8Array {
  const compact = value.replace(/\s/g, '');
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(compact)) throw new Error('Invalid Base64 ciphertext');
  try { return Uint8Array.from(atob(compact), char => char.charCodeAt(0)); }
  catch { throw new Error('Invalid Base64 ciphertext'); }
}

export function utf8(bytes: Uint8Array): string | undefined {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return undefined; }
}

export function requiredText(input: ToolInput | undefined, label: string): string {
  if (!input || input.kind !== 'text') throw new Error(`${label} text is required`);
  return input.text;
}

export function pem(label: string, bytes: Uint8Array): string {
  return `-----BEGIN ${label}-----\n${base64(bytes).match(/.{1,64}/g)?.join('\n') ?? ''}\n-----END ${label}-----\n`;
}

export function parsePem(value: string, label: string): Uint8Array {
  const match = value.trim().match(new RegExp(`^-----BEGIN ${label}-----\\s+([A-Za-z0-9+/=\\s]+)-----END ${label}-----$`));
  if (!match) throw new Error(`Invalid ${label} PEM`);
  try { return unbase64(match[1]!); } catch { throw new Error(`Invalid ${label} PEM`); }
}

export function webBuffer(bytes: Uint8Array): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}
