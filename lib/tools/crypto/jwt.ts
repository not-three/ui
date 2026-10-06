import type { ToolDefinition } from '../types';
export const jwt: ToolDefinition = {
  id: 'jwt', title: 'JWT', category: 'crypto', description: 'Decode JWT claims and verify HS256/384/512, RS256 or ES256 signatures locally. Decoded claims are untrusted until verified.', keywords: ['token', 'bearer', 'signature', 'decode', 'verify'],
  inputs: [{ id: 'input', label: 'JWT', kind: 'text', defaultSource: 'selection' }, { id: 'key', label: 'Secret or public PEM', kind: 'text', optional: true, defaultSource: 'empty' }], options: [], load: () => import('./jwt.impl'),
};
