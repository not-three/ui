import type { ToolDefinition } from '../types';
export const rotate: ToolDefinition = {
  id: 'rotate', title: 'Rotate and flip', category: 'image', description: 'Rotate an image by right angles or flip it.', keywords: ['image', 'orientation', 'mirror'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image' }], options: [
    { id: 'angle', label: 'Rotate', type: 'select', default: '0', values: ['0', '90', '180', '270'].map(value => ({ value, label: value + '°' })) },
    { id: 'flipHorizontal', label: 'Flip horizontal', type: 'boolean', default: false },
    { id: 'flipVertical', label: 'Flip vertical', type: 'boolean', default: false },
  ], load: () => import('./rotate.impl'),
};
