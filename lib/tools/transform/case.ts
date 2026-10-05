import type { ToolDefinition } from '../types';
export const letterCase: ToolDefinition = {
  id: 'case', title: 'Change case', category: 'transform',
  description: 'Change text to upper, lower, title, camel, snake, kebab, or constant case. Word forms split punctuation and acronyms.',
  keywords: ['case', 'uppercase', 'lowercase', 'camel', 'snake', 'kebab'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [{ id: 'style', label: 'Style', type: 'select', default: 'lower', values: ['upper', 'lower', 'title', 'camel', 'snake', 'kebab', 'constant'].map(value => ({ value, label: value[0]!.toUpperCase() + value.slice(1) })) }],
  load: () => import('./case.impl'),
};
