import { expect, it } from 'vitest';
import { resolveInput } from '../../../lib/tools/input';

it('rejects arbitrary text for image tools', async () => {
  await expect(resolveInput({ kind: 'image' }, { source: 'text', text: 'hello' })).rejects.toThrow('not an image');
});

it('rejects an oversized image file before reading its bytes', async () => {
  const file = { name: 'large.png', size: 256 * 1024 * 1024 + 1, arrayBuffer: () => { throw new Error('read'); } } as unknown as File;
  await expect(resolveInput({ kind: 'image' }, { source: 'file', file })).rejects.toThrow('256 MiB');
});
