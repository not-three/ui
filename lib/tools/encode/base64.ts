import type { ToolDefinition } from '../types';
export const base64: ToolDefinition = {
  id: 'base64', title: 'Base64', category: 'encode',
  description: 'Encode bytes as Base64 or decode Base64 to bytes. URL-safe mode uses - and _.',
  keywords: ['b64', 'radix64', 'binary'],
  inputs: [{ id: 'input', label: 'Input', kind: 'bytes', defaultSource: 'selection' }],
  options: [
    { id: 'mode', label: 'Mode', type: 'select', values: [{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }], default: 'encode' },
    { id: 'urlSafe', label: 'URL-safe', type: 'boolean', default: false },
  ],
  load: () => import('./base64.impl'),
};
