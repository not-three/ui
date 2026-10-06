import type { ToolDefinition } from '../types';
export const favicon: ToolDefinition = {
  id: 'favicon', title: 'Favicon set', category: 'image',
  description: 'Create a favicon.ico, PNG icons, and page and manifest snippets.',
  keywords: ['image', 'icon', 'website', 'manifest'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image' }],
  options: [16,32,48,64,128,180,192,512].map(size => ({ id: `size${size}`, label: `${size} × ${size}`, type: 'boolean' as const, default: true })),
  load: () => import('./favicon.impl'),
};
