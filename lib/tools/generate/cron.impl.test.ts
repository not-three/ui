import { expect, test } from 'vitest';
import { run } from './cron.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
test('explains cron and lists five UTC runs over month boundary', async () => {
  const result = await run({ input: textInput('0 0 1 * *') }, { timezone: 'UTC', from: '2026-01-31T00:00:00Z' }, context);
  expect(result).toMatchObject({ kind: 'multi', parts: [{ label: 'Explanation', output: { kind: 'text', text: expect.stringContaining('At 00:00 on day 1 of every month') } }, { label: 'Next runs', output: { kind: 'table', rows: expect.arrayContaining([['2026-02-01T00:00:00.000Z']]) } }] });
});
test('reports invalid cron', async () => {
  expect(await run({ input: textInput('60 * * * *') }, { timezone: 'UTC' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
test('accounts for daylight saving time in Europe/Berlin', async () => {
  const result = await run({ input: textInput('30 2 * * *') }, { timezone: 'Europe/Berlin', from: '2026-03-28T00:00:00Z' }, context);
  expect(result.kind).toBe('multi');
  if (result.kind === 'multi' && result.parts[1]?.output.kind === 'table') {
    expect(result.parts[1].output.rows.map(row => row[0])).not.toContain('2026-03-29T01:30:00.000Z');
  }
});
test('reports invalid timezone', async () => {
  expect(await run({ input: textInput('* * * * *') }, { timezone: 'Nowhere/Imaginary' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
