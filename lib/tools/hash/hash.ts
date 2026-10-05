import type { ToolDefinition } from '../types';
export const hash: ToolDefinition = {
  id: 'hash', title: 'Hash', category: 'hash',
  description: 'Stream a file or text through MD5, SHA, BLAKE3 or CRC32 and compare a digest.',
  inputs: [{ id: 'input', label: 'Input', kind: 'bytes', defaultSource: 'selection' }],
  options: [
    { id: 'algorithm', label: 'Algorithm', type: 'select', values: ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'sha3-256', 'blake3', 'crc32'].map(value => ({ value, label: value.toUpperCase() })), default: 'sha256' },
    { id: 'compareWith', label: 'Compare with', type: 'text', default: '', placeholder: 'Hex digest' },
  ],
  load: () => import('./hash.impl'),
};
