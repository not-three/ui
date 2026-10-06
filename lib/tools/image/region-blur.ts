import type { ToolDefinition } from '../types';
export const regionBlur: ToolDefinition = {
  id: 'region-blur', title: 'Blur region', category: 'image', description: 'Pixelate, blur or cover a selected area.', keywords: ['image', 'redact', 'pixelate', 'blur'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image', stage: 'region' }],
  options: [
    { id: 'effect', label: 'Effect', type: 'select', default: 'pixelate', values: [{ value: 'pixelate', label: 'Pixelate' }, { value: 'blur', label: 'Blur' }, { value: 'black-box', label: 'Black box' }] },
    { id: 'strength', label: 'Strength', type: 'number', default: 8, min: 1, max: 100 },
  ], load: () => import('./region-blur.impl'),
};
