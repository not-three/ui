import type { ToolDefinition } from '../types';
export const dataUrl: ToolDefinition = {
  id: 'data-url', title: 'Data URL', category: 'image',
  description: 'Turn an image into a data URL or a pasted image data URL back into an image.',
  keywords: ['image', 'data uri', 'text'],
  inputs: [{ id: 'input', label: 'Image or data URL', kind: 'image' }],
  options: [{ id: 'direction', label: 'Direction', type: 'select', default: 'encode', values: [{ value: 'encode', label: 'Image → data URL' }, { value: 'decode', label: 'Data URL → image' }] }],
  load: () => import('./data-url.impl'),
};
