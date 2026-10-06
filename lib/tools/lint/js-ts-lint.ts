import type { ToolDefinition } from '../types';
export const jsTsLint: ToolDefinition = {
  id: 'js-ts-lint', title: 'JavaScript / TypeScript lint', category: 'lint',
  description: 'Check JavaScript syntax and single-file TypeScript diagnostics.', keywords: ['javascript', 'typescript', 'syntax', 'types'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [{ id: 'language', label: 'Language', type: 'select', values: [{ value: 'auto', label: 'Auto' }, { value: 'javascript', label: 'JavaScript' }, { value: 'typescript', label: 'TypeScript' }], default: 'auto' }],
  load: () => import('./js-ts-lint.impl'),
};
