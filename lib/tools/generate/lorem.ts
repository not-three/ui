import type { ToolDefinition } from '../types';
export const lorem: ToolDefinition = {
  id: 'lorem', title: 'Lorem ipsum', category: 'generate',
  description: 'Generate placeholder words or paragraphs.', keywords: ['lorem', 'placeholder'],
  inputs: [],
  options: [{ id: 'mode', label: 'Mode', type: 'select', values: [{ value: 'words', label: 'Words' }, { value: 'paragraphs', label: 'Paragraphs' }], default: 'words' }, { id: 'count', label: 'Count', type: 'number', default: 50, min: 1, max: 1000 }],
  load: () => import('./lorem.impl'),
};
