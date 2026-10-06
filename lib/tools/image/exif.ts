import type { ToolDefinition } from '../types';
export const exif: ToolDefinition = {
  id: 'exif', title: 'EXIF viewer', category: 'image',
  description: 'Read camera details and location metadata in JPEG, PNG and WebP files.',
  keywords: ['image', 'metadata', 'camera', 'gps'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image' }], options: [],
  load: () => import('./exif.impl'),
};
