import type { ToolDefinition } from '../types';
export const sqlLint: ToolDefinition = {
  id: 'sql-lint', title: 'SQL lint', category: 'lint',
  description: 'Check SQL syntax with SQLite or PostgreSQL engines.', keywords: ['sql', 'sqlite', 'postgresql'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [{ id: 'dialect', label: 'Dialect', type: 'select', values: [{ value: 'sqlite', label: 'SQLite' }, { value: 'postgresql', label: 'PostgreSQL' }], default: 'sqlite' }],
  load: () => import('./sql-lint.impl'),
};
