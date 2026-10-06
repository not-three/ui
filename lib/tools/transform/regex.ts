import type { ToolDefinition } from '../types';
export const regex: ToolDefinition = {
  id: 'regex', title: 'Regex tester', category: 'transform',
  description: 'Find regex matches with line and column positions; optionally preview a replacement or deletion as a diff.',
  keywords: ['regex', 'regular expression', 'match', 'replace'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [
    { id: 'pattern', label: 'Pattern', type: 'text', default: '' },
    { id: 'flags', label: 'Flags', type: 'text', default: 'g' },
    { id: 'replacement', label: 'Replacement', type: 'text', default: '' },
    { id: 'previewDeletion', label: 'Preview deletion when replacement is empty', type: 'boolean', default: false },
  ],
  load: () => import('./regex.impl'),
};
