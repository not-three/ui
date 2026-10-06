import type { ToolDefinition } from '../types';
export const outline: ToolDefinition = {
  id: 'outline', title: 'Sticker outline', category: 'image', description: 'Add an outline around a transparent image.', keywords: ['image', 'sticker', 'border', 'shadow'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image' }],
  options: [
    { id: 'thickness', label: 'Thickness (px)', type: 'number', default: 12, min: 0, max: 128 },
    { id: 'colour', label: 'Colour', type: 'text', default: '#ffffff', placeholder: '#ffffff' },
    { id: 'roundCorners', label: 'Round corners', type: 'boolean', default: true },
    { id: 'shadow', label: 'Add shadow', type: 'boolean', default: false },
  ], load: () => import('./outline.impl'),
};
