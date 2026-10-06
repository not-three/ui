import type { ToolDefinition } from '../types';
export const escapeText: ToolDefinition = {
  id: 'escape', title: 'Escape text', category: 'transform',
  description: 'Escape text as a JSON string, JavaScript string, HTML entities, XML entities, or shell single-quoted argument.',
  keywords: ['escape', 'quote', 'json', 'javascript', 'html', 'xml', 'shell'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [{ id: 'format', label: 'Format', type: 'select', default: 'json', values: [{ value: 'json', label: 'JSON string' }, { value: 'js', label: 'JavaScript string' }, { value: 'html', label: 'HTML entities' }, { value: 'xml', label: 'XML entities' }, { value: 'shell', label: 'Shell single quote' }] }],
  load: () => import('./escape.impl'),
};
