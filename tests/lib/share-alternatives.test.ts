import { describe, expect, it } from 'vitest';
import { FragmentData } from '@not3/sdk';
import { createShareAlternatives } from '~/lib/share-alternatives';

const origin = 'https://not-th.re';
const uiBase = 'https://not-th.re/';
const defaultServer = '/api/';

describe('share alternatives', () => {
  it('keeps a CBC note fragment and lists all six ways to open it', () => {
    const fragment = new FragmentData({ seed: 'secret', selfDestruct: true, server: 'https://other.example/api/' });
    const rows = createShareAlternatives(
      { kind: 'note', id: 'note-1', seed: fragment.seed, cryptoMode: fragment.cryptoMode, fragment },
      fragment.server || defaultServer, defaultServer, uiBase, origin,
    );
    expect(rows.map(row => row.id)).toEqual(['ui', 'cli', 'docker', 'curl', 'powershell', 'server-decrypt']);
    expect(rows[0].value).toBe(`https://not-th.re/q/note-1#${fragment.toString()}`);
    expect(rows[1].value).toContain('--server https://other.example/api');
  });

  it('only offers Link, CLI and Docker for a GCM note', () => {
    const fragment = new FragmentData({ seed: 'secret', cryptoMode: 'gcm' });
    const rows = createShareAlternatives(
      { kind: 'note', id: 'note-1', seed: fragment.seed, cryptoMode: fragment.cryptoMode, fragment },
      defaultServer, defaultServer, uiBase, origin,
    );
    expect(rows.map(row => row.label)).toEqual(['Link', 'CLI', 'Docker']);
    expect(rows[0].value).toBe(`https://not-th.re/q/note-1#${fragment.toString()}`);
    expect(rows[1].value).toContain('--mode gcm');
  });

  it('uses the file name and absolute custom server for file commands', () => {
    const rows = createShareAlternatives(
      { kind: 'file', id: 'file-1', seed: 'secret', fileName: 'my file.txt' },
      '/custom/', defaultServer, uiBase, origin,
    );
    expect(rows.map(row => row.id)).toEqual(['ui', 'cli', 'docker', 'curl', 'powershell']);
    expect(FragmentData.fromURL(rows[0].value).server).toBe('https://not-th.re/custom/');
    expect(rows[1].value).toContain("'my file.txt'");
    expect(rows[1].value).toContain('--server https://not-th.re/custom');
  });

  it('uses the same P2P link for Link, CLI and Docker', () => {
    const rows = createShareAlternatives(
      { kind: 'p2p', id: 'session-1', seed: 'secret' },
      defaultServer, defaultServer, uiBase, origin,
    );
    expect(rows.map(row => row.id)).toEqual(['ui', 'cli', 'docker']);
    expect(rows[0].value).toBe(`https://not-th.re/f/session-1#${new FragmentData({ seed: 'secret', p2p: true, cryptoMode: 'gcm' }).toString()}`);
    expect(rows[1].value).toContain(rows[0].value);
  });

  it('does not mark the configured server as custom because of a trailing slash', () => {
    const rows = createShareAlternatives(
      { kind: 'file', id: 'file-1', seed: 'secret', fileName: 'note.txt' },
      'https://not-th.re/api/', '/api', uiBase, origin,
    );
    expect(FragmentData.fromURL(rows[0].value).server).toBeNull();
    expect(rows[1].value).not.toContain('--server');
  });
});
