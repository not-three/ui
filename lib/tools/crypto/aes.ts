import type { ToolDefinition } from '../types';
export const aes: ToolDefinition = {
  id: 'aes', title: 'AES', category: 'crypto', description: 'Encrypt or decrypt AES-GCM/CBC with a password or hex key. Output includes salt and IV. Web Crypto buffers each operation; maximum 64 MiB. For larger files, use File Transfer, which encrypts in chunks.',
  keywords: ['cipher', 'encryption', 'encrypt', 'decrypt', 'pbkdf2'],
  inputs: [{ id: 'input', label: 'Input', kind: 'bytes', defaultSource: 'selection' }, { id: 'key', label: 'Password or hex key', kind: 'text', defaultSource: 'empty' }],
  options: [
    { id: 'operation', label: 'Operation', type: 'select', values: [{ value: 'encrypt', label: 'Encrypt' }, { value: 'decrypt', label: 'Decrypt' }], default: 'encrypt' },
    { id: 'mode', label: 'Cipher mode', type: 'select', values: [{ value: 'gcm', label: 'GCM' }, { value: 'cbc', label: 'CBC' }], default: 'gcm' },
    { id: 'keyMode', label: 'Key source', type: 'select', values: [{ value: 'password', label: 'Password (PBKDF2)' }, { value: 'raw', label: 'Raw hex key' }], default: 'password' },
  ], load: () => import('./aes.impl'),
};
