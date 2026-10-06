import type { ToolDefinition } from '../types';
export const keypair: ToolDefinition = {
  id: 'keypair', title: 'Key pair', category: 'generate', description: 'Generate RSA-OAEP, RSA-PSS, ECDSA or supported Ed25519 keys locally and export PEM.', keywords: ['rsa', 'ecdsa', 'ed25519', 'pem', 'generator', 'keys'], inputs: [],
  options: [
    { id: 'algorithm', label: 'Algorithm', type: 'select', values: ['RSA-OAEP', 'RSA-PSS', 'ECDSA', 'Ed25519'].map(value => ({ value, label: value })), default: 'RSA-PSS' },
    { id: 'rsaBits', label: 'RSA bits', type: 'select', values: ['2048', '4096'].map(value => ({ value, label: value })), default: '2048' },
    { id: 'curve', label: 'ECDSA curve', type: 'select', values: ['P-256', 'P-384'].map(value => ({ value, label: value })), default: 'P-256' },
  ], load: () => import('./keypair.impl'),
};
