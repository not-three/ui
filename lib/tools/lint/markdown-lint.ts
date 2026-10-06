import type { ToolDefinition } from '../types';
export const markdownLint: ToolDefinition = {
  id: 'markdown-lint', title: 'Markdown lint', category: 'lint',
  description: 'Check basic Markdown heading and fenced-code structure.', keywords: ['markdown', 'heading', 'fence'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [],
  load: () => import('./markdown-lint.impl'),
};
