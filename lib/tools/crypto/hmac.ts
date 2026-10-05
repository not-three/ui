import type { ToolDefinition } from '../types';
export const hmac: ToolDefinition = {
  id: 'hmac', title: 'HMAC', category: 'crypto', description: 'Stream HMAC-MD5, SHA-1, SHA-2 or SHA3-256. BLAKE3 and CRC32 do not have a standard HMAC option here.',
  keywords: ['mac', 'authentication', 'digest'],
  inputs: [{ id: 'input', label: 'Input', kind: 'bytes', defaultSource: 'selection' }, { id: 'key', label: 'Secret key', kind: 'text', defaultSource: 'empty' }],
  options: [{ id: 'algorithm', label: 'Algorithm', type: 'select', values: ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'sha3-256'].map(value => ({ value, label: value.toUpperCase() })), default: 'sha256' }],
  load: () => import('./hmac.impl'),
};
