import type { ToolDefinition } from '../types';
export const password: ToolDefinition = {
  id: 'password', title: 'Password generator', category: 'generate', description: 'Generate a random secret locally and show its estimated entropy.', keywords: ['random', 'secret', 'entropy'], inputs: [],
  options: [
    { id: 'length', label: 'Length', type: 'number', default: 24, min: 1, max: 4096 },
    { id: 'lowercase', label: 'Lowercase', type: 'boolean', default: true },
    { id: 'uppercase', label: 'Uppercase', type: 'boolean', default: true },
    { id: 'digits', label: 'Digits', type: 'boolean', default: true },
    { id: 'symbols', label: 'Symbols', type: 'boolean', default: true },
  ], load: () => import('./password.impl'),
};
