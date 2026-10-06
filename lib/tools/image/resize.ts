import type { ToolDefinition } from '../types';
export const resize: ToolDefinition = {
  id: 'resize', title: 'Resize', category: 'image', description: 'Resize an image by width, height, percent or fit box.', keywords: ['image', 'dimensions', 'scale'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image' }], options: [
    { id: 'mode', label: 'Mode', type: 'select', default: 'width', values: ['width', 'height', 'percent', 'fit'].map(value => ({ value, label: ({ width: 'Width', height: 'Height', percent: 'Percent', fit: 'Fit box' } as Record<string,string>)[value]! })) },
    { id: 'width', label: 'Width', type: 'number', default: 1024, min: 1, max: 16384 },
    { id: 'height', label: 'Height', type: 'number', default: 1024, min: 1, max: 16384 },
    { id: 'percent', label: 'Percent', type: 'number', default: 50, min: 1 },
    { id: 'keepAspect', label: 'Keep aspect', type: 'boolean', default: true },
    { id: 'upscale', label: 'Allow upscaling', type: 'boolean', default: false },
  ], load: () => import('./resize.impl'),
};
