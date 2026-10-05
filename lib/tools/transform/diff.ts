import type { ToolDefinition } from '../types';
export const diff: ToolDefinition = {
  id: 'diff', title: 'Diff', category: 'transform',
  description: 'Compare two text inputs. Take either side into the current note.',
  inputs: [
    { id: 'left', label: 'Left', kind: 'text', defaultSource: 'note' },
    { id: 'right', label: 'Right', kind: 'text', defaultSource: 'empty' },
  ],
  options: [{ id: 'ignoreWhitespace', label: 'Ignore whitespace', type: 'boolean', default: false }],
  load: () => import('./diff.impl'),
};
