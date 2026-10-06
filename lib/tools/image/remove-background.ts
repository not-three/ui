import type { ToolDefinition } from '../types';
import { MODEL_BYTES, MODEL_FETCH_PROGRESS_END } from '../../image/background-model';

export const removeBackground: ToolDefinition = {
  id: 'remove-background', title: 'Remove background', category: 'image',
  description: 'Downloads a 40–90 MB model once per session. Runs only when you click Run.',
  keywords: ['image', 'transparent', 'segmentation', 'cutout'],
  inputs: [{ id: 'input', label: 'Image', kind: 'image' }],
  options: [{ id: 'feather', label: 'Feather edge (px)', type: 'number', default: 2, min: 0, max: 8 }],
  heavy: true,
  downloadProgress: { totalBytes: MODEL_BYTES, endsAt: MODEL_FETCH_PROGRESS_END },
  load: () => import('./remove-background.impl'),
};
