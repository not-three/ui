import type { ToolDefinition } from '../types';
export const palette: ToolDefinition = {
  id: 'palette', title: 'Colour picker', category: 'image', description: 'Pick a pixel colour and find the dominant colours.', keywords: ['image', 'colour', 'color', 'swatches'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image', stage: 'point' }],
  options: [{ id: 'swatches', label: 'Swatches', type: 'number', default: 6, min: 3, max: 12 }],
  load: () => import('./palette.impl'),
};
