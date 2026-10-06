import type { ToolDefinition } from '../types';
export const compress: ToolDefinition = {
  id: 'compress', title: 'Compress', category: 'image',
  description: 'Compress an image at a chosen quality or to fit a maximum file size.',
  keywords: ['image', 'quality', 'size', 'webp'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image' }],
  options: [
    { id: 'target', label: 'Target', type: 'select', default: 'quality', values: [{ value: 'quality', label: 'Quality' }, { value: 'max-size', label: 'Max size' }] },
    { id: 'quality', label: 'Quality', type: 'number', default: 82, min: 1, max: 100 },
    { id: 'maxSize', label: 'Max size', type: 'number', default: 100, min: 1 },
    { id: 'unit', label: 'Unit', type: 'select', default: 'KB', values: [{ value: 'KB', label: 'KB' }, { value: 'MB', label: 'MB' }] },
  ], load: () => import('./compress.impl'),
};
