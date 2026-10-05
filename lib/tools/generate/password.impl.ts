import type { ToolRun } from '../types';
export const run: ToolRun = async (_inputs, options) => {
  const length = Number(options.length ?? 24);
  if (!Number.isInteger(length) || length < 1 || length > 4096) throw new Error('Length must be 1–4096');
  const alphabet = (options.lowercase !== false ? 'abcdefghijklmnopqrstuvwxyz' : '') + (options.uppercase !== false ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '') + (options.digits !== false ? '0123456789' : '') + (options.symbols !== false ? '!@#$%^&*()-_=+[]{};:,.?' : '');
  if (!alphabet) throw new Error('Choose at least one character set');
  const max = Math.floor(256 / alphabet.length) * alphabet.length;
  let secret = '';
  while (secret.length < length) {
    const random = crypto.getRandomValues(new Uint8Array(Math.min(65536, (length - secret.length) * 2)));
    for (const byte of random) if (byte < max) { secret += alphabet[byte % alphabet.length]; if (secret.length === length) break; }
  }
  return { kind: 'multi', parts: [
    { label: 'Secret', output: { kind: 'text', text: secret, filename: 'secret.txt' } },
    { label: 'Entropy', output: { kind: 'table', columns: ['Estimated bits'], rows: [[Math.round(length * Math.log2(alphabet.length) * 10) / 10]] } },
  ] };
};
