import type { ToolDefinition } from '../types';
export const timestamp: ToolDefinition = {
  id: 'timestamp', title: 'Timestamp converter', category: 'transform',
  description: 'Convert Unix seconds, ISO 8601, or RFC 2822 dates to Unix, ISO, or RFC output in an IANA timezone.',
  keywords: ['timestamp', 'unix', 'epoch', 'iso', 'rfc', 'timezone'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [
    { id: 'format', label: 'Output format', type: 'select', default: 'iso', values: [{ value: 'unix', label: 'Unix seconds' }, { value: 'iso', label: 'ISO 8601' }, { value: 'rfc', label: 'RFC 2822' }] },
    { id: 'timezone', label: 'Timezone', type: 'text', default: 'UTC', placeholder: 'UTC or Europe/Berlin' },
  ],
  load: () => import('./timestamp.impl'),
};
