import type { ToolDefinition } from '../types';
export const crop: ToolDefinition = {
  id: 'crop', title: 'Crop', category: 'image', description: 'Crop an image to a selected rectangle.', keywords: ['image', 'trim', 'aspect', 'rectangle'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image', stage: 'crop' }],
  options: [
    { id: 'aspect', label: 'Aspect', type: 'select', default: 'free', values: [
      { value: 'free', label: 'Free' }, { value: '1:1', label: '1:1' }, { value: '4:3', label: '4:3' }, { value: '16:9', label: '16:9' }, { value: '3:2', label: '3:2' }, { value: 'custom', label: 'Custom' },
    ] },
    { id: 'customRatio', label: 'Custom ratio', type: 'text', default: '1:1', placeholder: '4:3' },
  ], load: () => import('./crop.impl'),
};
