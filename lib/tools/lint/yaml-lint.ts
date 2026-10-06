import type { ToolDefinition } from '../types';
export const yamlLint: ToolDefinition = {
  id: 'yaml-lint', title: 'YAML lint', category: 'lint',
  description: 'Check YAML syntax and structure with parser locations.', keywords: ['yaml', 'syntax'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [],
  load: () => import('./yaml-lint.impl'),
};
