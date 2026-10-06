import type { ToolDefinition } from '../types';
export const htmlLint: ToolDefinition = {
  id: 'html-lint', title: 'HTML lint', category: 'lint',
  description: 'Check HTML parse syntax with the Prettier parser.', keywords: ['html', 'syntax'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [],
  load: () => import('./html-lint.impl'),
};
