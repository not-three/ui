import type { ToolRun } from '../types';
import { base64, readBytes, requiredText, unbase64, utf8, webBuffer } from './bytes';
const magic = new TextEncoder().encode('N3AES1');
const limit = 64 * 1024 * 1024;
export const run: ToolRun = async (inputs, options, context) => {
  const input = inputs.input;
  if (!input) throw new Error('Input is required');
  const secret = requiredText(inputs.key, 'Password or key');
  if (!secret) throw new Error('Password or key is required');
  const operation = String(options.operation || 'encrypt');
  const mode = String(options.mode || 'gcm');
  const keyMode = String(options.keyMode || 'password');
  if (!['encrypt', 'decrypt'].includes(operation) || !['gcm', 'cbc'].includes(mode) || !['password', 'raw'].includes(keyMode)) throw new Error('Invalid AES option');
  const textSource = input.kind === 'text' || (input.kind === 'bytes' && input.source !== 'file' && !!input.source);
  let data = await readBytes(input, context, limit);
  if (operation === 'decrypt' && textSource) data = unbase64(new TextDecoder('utf-8', { fatal: true }).decode(data));
  let salt: Uint8Array;
  let iv: Uint8Array;
  let payload: Uint8Array;
  if (operation === 'encrypt') {
    salt = crypto.getRandomValues(new Uint8Array(16));
    iv = crypto.getRandomValues(new Uint8Array(mode === 'gcm' ? 12 : 16));
    payload = data;
    if (mode === 'cbc') {
      const checksum = new Uint8Array(await crypto.subtle.digest('SHA-256', webBuffer(data)));
      payload = new Uint8Array(checksum.length + data.length);
      payload.set(checksum); payload.set(data, checksum.length);
    }
  } else {
    if (data.length < 6 + 2 + 16 + 12 + 16 || magic.some((byte, index) => data[index] !== byte)) throw new Error('Malformed AES ciphertext');
    const encodedMode = data[6] === 1 ? 'gcm' : data[6] === 2 ? 'cbc' : null;
    const encodedKeyMode = data[7] === 1 ? 'password' : data[7] === 2 ? 'raw' : null;
    if (!encodedMode || !encodedKeyMode) throw new Error('Malformed AES ciphertext');
    if (mode !== encodedMode || keyMode !== encodedKeyMode) throw new Error('Cipher mode or key source does not match ciphertext');
    salt = data.subarray(8, 24);
    const ivLength = mode === 'gcm' ? 12 : 16;
    iv = data.subarray(24, 24 + ivLength);
    payload = data.subarray(24 + ivLength);
  }
  let raw: Uint8Array;
  if (keyMode === 'raw') {
    if (!/^(?:[0-9a-fA-F]{2})+$/.test(secret) || ![32, 48, 64].includes(secret.length)) throw new Error('Raw key must be 16, 24 or 32 bytes of hex');
    raw = Uint8Array.from(secret.match(/../g)!, pair => Number.parseInt(pair, 16));
  } else {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits']);
    raw = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: webBuffer(salt), iterations: 210_000 }, base, 256));
  }
  const algorithm = mode === 'gcm' ? 'AES-GCM' : 'AES-CBC';
  const key = await crypto.subtle.importKey('raw', webBuffer(raw), algorithm, false, [operation === 'encrypt' ? 'encrypt' : 'decrypt']);
  raw.fill(0);
  const params = { name: algorithm, iv: webBuffer(iv) };
  try {
    let result = new Uint8Array(operation === 'encrypt' ? await crypto.subtle.encrypt(params, key, webBuffer(payload)) : await crypto.subtle.decrypt(params, key, webBuffer(payload)));
    if (operation === 'decrypt' && mode === 'cbc') {
      if (result.length < 32) throw new Error('Invalid CBC payload');
      const checksum = result.subarray(0, 32);
      const plaintext = result.subarray(32);
      const computed = new Uint8Array(await crypto.subtle.digest('SHA-256', webBuffer(plaintext)));
      if (!checksum.every((byte, index) => byte === computed[index])) throw new Error('CBC integrity check failed');
      result = plaintext.slice();
    }
    context.reportProgress(1);
    if (operation === 'decrypt') {
      const text = utf8(result);
      return textSource && text !== undefined ? { kind: 'text', text, language: 'plaintext', filename: 'decrypted.txt' } : { kind: 'bytes', bytes: result, text, filename: 'decrypted.bin' };
    }
    const wrapped = new Uint8Array(6 + 2 + salt.length + iv.length + result.length);
    wrapped.set(magic); wrapped[6] = mode === 'gcm' ? 1 : 2; wrapped[7] = keyMode === 'password' ? 1 : 2;
    wrapped.set(salt, 8); wrapped.set(iv, 24); wrapped.set(result, 24 + iv.length);
    return textSource ? { kind: 'text', text: base64(wrapped), language: 'plaintext', filename: 'encrypted.b64' } : { kind: 'bytes', bytes: wrapped, filename: 'encrypted.aes', mimeType: 'application/octet-stream' };
  } catch { throw new Error('Cipher authentication failed or ciphertext is malformed'); }
};
