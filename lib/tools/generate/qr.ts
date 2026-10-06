import type { ToolDefinition } from '../types';
export const qr: ToolDefinition = {
  id: 'qr', title: 'QR code', category: 'generate',
  description: 'Create a PNG QR code from text; pick a larger width for print.', keywords: ['qr', 'png', 'barcode'],
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }],
  options: [{ id: 'width', label: 'Width (px)', type: 'number', default: 256, min: 64, max: 4096 }, { id: 'margin', label: 'Margin', type: 'number', default: 4, min: 0, max: 16 }, { id: 'errorCorrection', label: 'Error correction', type: 'select', values: ['L','M','Q','H'].map(value => ({ value, label: value })), default: 'M' }],
  load: () => import('./qr.impl'),
};
