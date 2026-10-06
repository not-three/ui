import type { ToolDefinition } from '../types';
export const uuid: ToolDefinition = {
  id: 'uuid', title: 'UUID', category: 'generate',
  description: 'Generate or inspect UUID version 4 and 7 values.', keywords: ['uuid', 'identifier'],
  inputs: [{ id: 'input', label: 'UUID', kind: 'text', optional: true, defaultSource: 'empty' }],
  options: [{ id: 'mode', label: 'Mode', type: 'select', values: [{ value: 'generate', label: 'Generate' }, { value: 'inspect', label: 'Inspect' }], default: 'generate' }, { id: 'version', label: 'Version', type: 'select', values: [{ value: 'v4', label: 'v4' }, { value: 'v7', label: 'v7' }], default: 'v4' }],
  load: () => import('./uuid.impl'),
};
