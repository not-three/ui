import type { ToolDefinition } from '../types';
export const stripMetadata: ToolDefinition = {
  id: 'strip-metadata', title: 'Strip metadata', category: 'image',
  description: 'Remove image metadata while preserving JPEG, PNG and WebP image data where possible.',
  keywords: ['image', 'metadata', 'privacy', 'exif'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image' }],
  options: [{ id: 'keepOrientation', label: 'Keep orientation', type: 'boolean', default: true }],
  load: () => import('./strip-metadata.impl'),
};
