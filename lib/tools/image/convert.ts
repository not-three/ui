import type { ToolDefinition } from '../types';
export const convert: ToolDefinition = {
  id: 'convert', title: 'Convert', category: 'image', description: 'Convert an image to another format with the export controls.', keywords: ['image', 'png', 'jpeg', 'webp', 'avif', 'jxl'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image' }], options: [], load: () => import('./convert.impl'),
};
