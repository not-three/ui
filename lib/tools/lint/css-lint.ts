import type { ToolDefinition } from '../types';
export const cssLint: ToolDefinition = {
  id: 'css-lint', title: 'CSS lint', category: 'lint',
  description: 'Check CSS syntax with the Prettier parser.', keywords: ['css', 'syntax'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [],
  load: () => import('./css-lint.impl'),
};
