import { expect, test } from 'vitest';
import { run } from './caesar.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('shifts ASCII and preserves non-ASCII', async () => {
  expect(await run({ input: textInput('Abc é') }, { shift: 3 }, context)).toMatchObject({ text: 'Def é' });
  expect(await run({ input: textInput('Def é') }, { shift: -3 }, context)).toMatchObject({ text: 'Abc é' });
});
test('rejects fractional shifts', async () => {
  await expect(run({ input: textInput('x') }, { shift: 1.5 }, context)).rejects.toThrow(/shift/i);
});
