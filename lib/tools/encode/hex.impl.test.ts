import { expect, it } from 'vitest';
import { run } from './hex.impl';
import { bytesInput, textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
it('encodes bytes and decodes hex', async () => {
  expect(await run({ input: bytesInput(new Uint8Array([0, 255])) }, { mode: 'encode' }, context)).toMatchObject({ kind: 'text', text: '00ff' });
  const result = await run({ input: textInput('00ff') }, { mode: 'decode' }, context);
  if (result.kind === 'bytes') expect(result.bytes).toEqual(new Uint8Array([0, 255]));
  else throw Error('expected bytes');
});
it('rejects odd length and invalid digits', async () => {
  await expect(run({ input: textInput('abc') }, { mode: 'decode' }, context)).rejects.toThrow();
  await expect(run({ input: textInput('zz') }, { mode: 'decode' }, context)).rejects.toThrow();
});
