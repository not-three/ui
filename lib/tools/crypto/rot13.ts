import type { ToolDefinition } from '../types';
export const rot13: ToolDefinition = { id: 'rot13', title: 'ROT13', category: 'crypto', description: 'Rotate ASCII letters by 13; leave other characters unchanged.', keywords: ['rotate', 'substitution'], inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'selection' }], options: [], load: () => import('./rot13.impl') };
