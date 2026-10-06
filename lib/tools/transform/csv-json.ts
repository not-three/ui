import type { ToolDefinition } from '../types';
export const csvJson: ToolDefinition = {
  id: 'csv-json', title: 'CSV ↔ JSON', category: 'transform',
  description: 'Convert header-based CSV rows to JSON objects, or a JSON object array to CSV.',
  keywords: ['csv', 'json', 'spreadsheet', 'convert'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [{ id: 'direction', label: 'Direction', type: 'select', default: 'csv-json', values: [{ value: 'csv-json', label: 'CSV to JSON' }, { value: 'json-csv', label: 'JSON to CSV' }] }],
  load: () => import('./csv-json.impl'),
};
