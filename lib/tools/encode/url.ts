import type { ToolDefinition } from '../types';
export const url: ToolDefinition = {
  id: 'url', title: 'URL encode/decode', category: 'encode',
  description: 'Percent-encode or decode text as a URL component or a full URL.',
  keywords: ['uri', 'percent', 'escape'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'selection' }],
  options: [
    { id: 'mode', label: 'Mode', type: 'select', values: [{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }], default: 'encode' },
    { id: 'scope', label: 'Scope', type: 'select', values: [{ value: 'component', label: 'Component' }, { value: 'url', label: 'Full URL' }], default: 'component' },
  ],
  load: () => import('./url.impl'),
};
