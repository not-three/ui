import { expect, test } from 'vitest';
import { run } from './hmac.impl';
import { chunksInput, textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('streams HMAC SHA-256 with a key input and matches the known vector', async () => {
  const output = await run({ input: chunksInput([new TextEncoder().encode('a'), new TextEncoder().encode('bc')]), key: textInput('key') }, { algorithm: 'sha256' }, context);
  expect(output).toMatchObject({ kind: 'table', rows: [['sha256', '9c196e32dc0175f86f4b1cb89289d6619de6bee699e4c378e68309ed97a1a6ab', 'nBluMtwBdfhvSxy4konWYZ3mvuaZ5MN45oMJ7Zehpqs=']] });
});
test('rejects hash algorithms without an advertised HMAC construction', async () => {
  await expect(run({ input: textInput('abc'), key: textInput('key') }, { algorithm: 'crc32' }, context)).rejects.toThrow(/unsupported/i);
});
test.each([
  ['md5', 'd2fe98063f876b03193afb49b4979591'],
  ['sha1', '4fd0b215276ef12f2b3e4c8ecac2811498b656fc'],
  ['sha384', '30ddb9c8f347cffbfb44e519d814f074cf4047a55d6f563324f1c6a33920e5edfb2a34bac60bdc96cd33a95623d7d638'],
  ['sha512', '3926a207c8c42b0c41792cbd3e1a1aaaf5f7a25704f62dfc939c4987dd7ce060009c5bb1c2447355b3216f10b537e9afa7b64a4e5391b0d631172d07939e087a'],
  ['sha3-256', '09b6dbab8d11795ca7c8d82f1cf91682013c7cb980abbb25473be4ae7f7b5683'],
])('HMAC %s matches an independent vector for text', async (algorithm, hex) => {
  const output = await run({ input: textInput('abc'), key: textInput('key') }, { algorithm }, context);
  expect(output.kind).toBe('table');
  if (output.kind === 'table') expect(output.rows[0]?.[1]).toBe(hex);
});
test('hashes empty and large inputs while reporting stream progress', async () => {
  const empty = await run({ input: textInput(''), key: textInput('key') }, { algorithm: 'sha256' }, context);
  expect(empty.kind).toBe('table');
  if (empty.kind === 'table') expect(empty.rows[0]?.[1]).toBe('5d5d139563c95b5967b9bd9a8c9b233a9dedb45072794cd232dc1b74832607d0');
  const progress: number[] = [];
  const chunk = new Uint8Array(256 * 1024).fill(97);
  const large = await run({ input: chunksInput([chunk, chunk, chunk, chunk]), key: textInput('key') }, { algorithm: 'sha256' }, { signal: context.signal, reportProgress: value => progress.push(value) });
  expect(large.kind).toBe('table');
  if (large.kind === 'table') expect(large.rows[0]?.[1]).toBe('d26ceee77400256ebbd41cd3c185e338299725ec94963005012ed9df2cfc0c76');
  expect(progress).toContain(1);
});
