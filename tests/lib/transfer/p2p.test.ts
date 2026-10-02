import { describe, expect, it } from 'vitest';
import { FragmentData } from '@not3/sdk';
import { absoluteApiBase, chunkTotals, isP2PFragment, p2pApiFor } from '~/lib/transfer/p2p';

describe('P2P URL and progress helpers', () => {
  const p2p = `https://ui.example/f/session#${new FragmentData({ seed: 'secret', p2p: true, cryptoMode: 'gcm' })}`;
  const ordinary = `https://ui.example/f/file#${new FragmentData({ seed: 'secret' })}`;

  it('routes only flagged file links to P2P, keeping ordinary file links ordinary', () => {
    expect(isP2PFragment(p2p)).toBe(true);
    expect(isP2PFragment(ordinary)).toBe(false);
    expect(isP2PFragment('https://ui.example/f/file#broken')).toBe(false);
  });

  it('resolves relative API bases for WebSocket signaling', () => {
    expect(absoluteApiBase('/api/', 'https://ui.example')).toBe('https://ui.example/api/');
    expect(absoluteApiBase('https://other.example/api/', 'https://ui.example')).toBe('https://other.example/api/');
    expect(p2pApiFor(null, '/api/', 'https://ui.example').p2p().gatewayUrl()).toBe('wss://ui.example/api/p2p');
  });

  it('keeps a custom API path when the base lacks a trailing slash', () => {
    expect(absoluteApiBase('https://api.example/sub', 'https://ui.example')).toBe('https://api.example/sub/');
    expect(p2pApiFor('https://api.example/sub', '/api/', 'https://ui.example').p2p().gatewayUrl())
      .toBe('wss://api.example/sub/p2p');
  });

  it('rounds byte progress up to complete chunks and handles empty files', () => {
    expect(chunkTotals(10, 4, 5)).toEqual({ status: 2, total: 3 });
    expect(chunkTotals(0, 4, 0)).toEqual({ status: 0, total: 0 });
  });
});
