import { expect, it } from 'vitest';
import { searchTools } from '~/lib/tools/search';

it('finds title typos and keyword matches without changing catalogue order', () => {
  expect(searchTools('bse64').map(tool => tool.id)).toEqual(['base64']);
  expect(searchTools('checksum').map(tool => tool.id)).toContain('hash');
  expect(searchTools('syntax').map(tool => tool.id)).toContain('json-lint');
  expect(searchTools('no-such-query')).toEqual([]);
});
