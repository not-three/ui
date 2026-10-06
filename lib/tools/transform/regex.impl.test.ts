import { expect, it } from 'vitest';
import { run } from './regex.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };

it('reports one-based match positions across lines', async () => {
  const result = await run({ input: textInput('cat\ndog cat') }, { pattern: 'cat', flags: 'g', replacement: '' }, context);
  expect(result).toMatchObject({ kind: 'report', items: [{ position: { line: 1, column: 1 } }, { position: { line: 2, column: 5 } }] });
});

it('shows replacement preview as labelled report and diff parts', async () => {
  const result = await run({ input: textInput('cat cat') }, { pattern: 'cat', flags: 'g', replacement: 'dog' }, context);
  expect(result).toMatchObject({ kind: 'multi', parts: [{ label: 'Matches', output: { kind: 'report' } }, { label: 'Replacement preview', output: { kind: 'diff', left: 'cat cat', right: 'dog dog' } }] });
});

it('reports only the replacement target when global flag is absent', async () => {
  const result = await run({ input: textInput('cat cat') }, { pattern: 'cat', flags: '', replacement: 'dog' }, context);
  expect(result).toMatchObject({ kind: 'multi', parts: [
    { label: 'Matches', output: { kind: 'report', items: [{ position: { line: 1, column: 1 } }] } },
    { label: 'Replacement preview', output: { kind: 'diff', left: 'cat cat', right: 'dog cat' } },
  ] });
});

it('surfaces invalid patterns and terminates zero-width global matches', async () => {
  expect(await run({ input: textInput('x') }, { pattern: '[', flags: 'g', replacement: '' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
  const result = await run({ input: textInput('ab') }, { pattern: '(?=.)', flags: 'g', replacement: '' }, context);
  expect(result).toMatchObject({ kind: 'report' });
  if (result.kind === 'report') expect(result.items).toHaveLength(2);
});

it('bounds zero-width match reports for large text', async () => {
  const result = await run({ input: textInput('x'.repeat(20_000)) }, { pattern: '', flags: 'g', replacement: '' }, context);
  expect(result.kind).toBe('report');
  if (result.kind === 'report') {
    expect(result.items).toHaveLength(1001);
    expect(result.items.at(-1)).toMatchObject({ level: 'warning', message: expect.stringContaining('omitted') });
  }
});
