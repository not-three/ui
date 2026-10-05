import { expect, test } from 'vitest';
import { run } from './lorem.impl';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('generates bounded word count', async () => {
  const result = await run({}, { mode: 'words', count: 12 }, context);
  expect(result.kind).toBe('text');
  if (result.kind === 'text') expect(result.text.trim().split(/\s+/)).toHaveLength(12);
});
test('generates paragraph count', async () => {
  const result = await run({}, { mode: 'paragraphs', count: 3 }, context);
  expect(result.kind).toBe('text');
  if (result.kind === 'text') expect(result.text.split('\n\n')).toHaveLength(3);
});
test('rejects counts outside bounds', async () => {
  await expect(run({}, { count: 0 }, context)).rejects.toThrow('Count');
  await expect(run({}, { count: 1001 }, context)).rejects.toThrow('Count');
});
