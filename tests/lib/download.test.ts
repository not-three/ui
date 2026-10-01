import { describe, expect, it, vi } from 'vitest';
import { DownloadDb } from '~/lib/download';

describe('DownloadDb.reset', () => {
  it('clears the ordinary download database when called as an unload listener', () => {
    const deleteDatabase = vi.fn();
    vi.stubGlobal('indexedDB', { deleteDatabase });
    try {
      DownloadDb.reset(new Event('beforeunload'));
      expect(deleteDatabase).toHaveBeenCalledWith('download');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
