import type { ToolDefinition } from '../types';
export const hex: ToolDefinition = {
  id: 'hex', title: 'Hex', category: 'encode',
  description: 'Encode bytes as hexadecimal text or decode validated hex to bytes.',
  keywords: ['hexadecimal', 'bytes'],
  inputs: [{ id: 'input', label: 'Input', kind: 'bytes', defaultSource: 'selection' }],
  options: [{ id: 'mode', label: 'Mode', type: 'select', values: [{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }], default: 'encode' }],
  load: () => import('./hex.impl'),
};
