import type { ToolDefinition } from '../types';
export const jsonLint: ToolDefinition = {
  id: 'json-lint', title: 'JSON lint', category: 'lint',
  description: 'Check JSON syntax and show the parser error location.',
  keywords: ['json', 'validate', 'syntax'],
  inputs: [{ id: 'input', label: 'JSON', kind: 'text', defaultSource: 'note' }], options: [],
  load: () => import('./json-lint.impl'),
};
