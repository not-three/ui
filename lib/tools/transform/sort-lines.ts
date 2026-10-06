import type { ToolDefinition } from '../types';
export const sortLines: ToolDefinition = {
  id: 'sort-lines', title: 'Sort lines', category: 'transform',
  description: 'Sort lines stably, with numeric, reverse, and unique choices. Equal values keep their order; a trailing newline stays.',
  keywords: ['sort', 'lines', 'unique', 'numeric'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [
    { id: 'unique', label: 'Unique', type: 'boolean', default: false },
    { id: 'numeric', label: 'Numeric', type: 'boolean', default: false },
    { id: 'reverse', label: 'Reverse', type: 'boolean', default: false },
  ],
  load: () => import('./sort-lines.impl'),
};
