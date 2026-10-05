import type { ToolDefinition } from '../types';
export const cron: ToolDefinition = {
  id: 'cron', title: 'Cron', category: 'generate',
  description: 'Explain a cron expression and show its next five runs.', keywords: ['cron', 'schedule', 'timezone'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [{ id: 'timezone', label: 'Timezone', type: 'text', default: 'UTC' }, { id: 'from', label: 'From (ISO)', type: 'text', default: '' }],
  load: () => import('./cron.impl'),
};
