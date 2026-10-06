import type { ToolDefinition } from '../types';
export const xmlLint: ToolDefinition = {
  id: 'xml-lint', title: 'XML lint', category: 'lint',
  description: 'Check XML well formedness and report parser errors.', keywords: ['xml', 'syntax'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [],
  load: () => import('./xml-lint.impl'),
};
