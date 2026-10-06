import { expect, it } from 'vitest';
import { run } from './hash.impl';
import { chunksInput, textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
it('hashes a multi-chunk stream as SHA-256 and gives hex/base64', async () => {
  const result = await run({ input: chunksInput([new TextEncoder().encode('a'), new TextEncoder().encode('bc')]) }, { algorithm: 'sha256', compareWith: '' }, context);
  expect(result).toMatchObject({ kind: 'table', columns: ['Algorithm', 'Hex', 'Base64'], rows: [['sha256', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=']] });
});
it('includes comparison outcome', async () => {
  const result = await run({ input: textInput('abc') }, { algorithm: 'crc32', compareWith: '352441c2' }, context);
  expect(result.kind).toBe('table');
  if (result.kind === 'table') expect(result.rows[0]).toContain('Match');
});
it('supports all advertised algorithms', async () => {
  for (const algorithm of ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'sha3-256', 'blake3', 'crc32']) {
    const result = await run({ input: textInput('abc') }, { algorithm, compareWith: '' }, context);
    expect(result.kind).toBe('table');
  }
});
