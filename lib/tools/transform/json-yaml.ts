import type { ToolDefinition } from '../types';
export const jsonYaml: ToolDefinition = {
  id: 'json-yaml', title: 'JSON ↔ YAML', category: 'transform',
  description: 'Convert JSON to YAML or YAML to formatted JSON, with syntax locations for invalid input.',
  keywords: ['json', 'yaml', 'convert'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [{ id: 'direction', label: 'Direction', type: 'select', default: 'json-yaml', values: [{ value: 'json-yaml', label: 'JSON to YAML' }, { value: 'yaml-json', label: 'YAML to JSON' }] }],
  load: () => import('./json-yaml.impl'),
};
