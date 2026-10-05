import type { ToolDefinition } from '../types';
export const textStats: ToolDefinition = {
  id: 'text-stats', title: 'Text statistics', category: 'transform',
  description: 'Count Unicode characters, words, lines, UTF-8 bytes, and estimated reading time at 200 words per minute.',
  keywords: ['text', 'stats', 'count', 'words', 'bytes'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }], options: [],
  load: () => import('./text-stats.impl'),
};
