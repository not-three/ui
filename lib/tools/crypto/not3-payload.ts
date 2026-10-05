import type { ToolDefinition } from '../types';
export const not3Payload: ToolDefinition = {
  id: 'not3-payload', title: '!3 payload decrypt', category: 'crypto', description: 'Decrypt a pasted !3 encrypted note payload locally with its fragment seed.', keywords: ['not3', 'fragment', 'seed'],
  inputs: [{ id: 'input', label: 'Encrypted payload', kind: 'text', defaultSource: 'empty' }, { id: 'seed', label: 'Fragment seed', kind: 'text', defaultSource: 'empty' }], options: [], load: () => import('./not3-payload.impl'),
};
