import type { ToolDefinition } from '../types';
export const markdownHtml: ToolDefinition = {
  id: 'markdown-html', title: 'Markdown to HTML', category: 'transform',
  description: 'Render Markdown to HTML with raw HTML escaped.',
  keywords: ['markdown', 'html', 'render'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }], options: [],
  load: () => import('./markdown-html.impl'),
};
