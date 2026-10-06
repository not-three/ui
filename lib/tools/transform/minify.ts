import type { ToolDefinition } from '../types';
export const minify: ToolDefinition = {
  id: 'minify', title: 'Minify', category: 'transform',
  description: 'Minify JSON, CSS, or HTML. HTML text spacing and pre, script, and style content are preserved.',
  keywords: ['minify', 'compress', 'json', 'css', 'html'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [{ id: 'format', label: 'Format', type: 'select', default: 'json', values: [{ value: 'json', label: 'JSON' }, { value: 'css', label: 'CSS' }, { value: 'html', label: 'HTML' }] }],
  load: () => import('./minify.impl'),
};
