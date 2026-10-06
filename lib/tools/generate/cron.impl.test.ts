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
test.each([
  '1-2-3 * * * *', '*/5/2 * * * *', '-1 * * * *', '*/ * * * *', '1,,2 * * * *',
  '* 1-2-3 * * *', '* * 1, * *', '* * * JAN-BOGUS *', '* * * * MON-TUE-WED',
  '* * * * */2/3', '0 24 * * *', '0 0 32 * *', '0 0 * 13 *', '0 0 * * 8',
  '0 0 * * FUNDAY', '0 0 * * MON-FRI/0', 'JAN * * * *',
])('rejects malformed cron field %s', async expression => {
  expect(await run({ input: textInput(expression) }, { timezone: 'UTC' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error', message: expect.stringContaining('Invalid cron field') }] });
});
test.each([
  ['minute step', '*/15 * * * *', 'Every 15 minutes'],
  ['one-minute step', '*/1 * * * *', 'Every minute'],
  ['minute step within one hour', '*/2 10 * * *', 'Every 2 minutes during hour 10'],
  ['hour range with step and minute list', '5,35 8-10/2 * * *', 'every 2 hours from 8 through 10'],
  ['weekday name range', '0 9 * * MON-FRI', 'Monday through Friday'],
  ['month name list and day range', '0 9 1-5 JAN,MAR *', 'days 1 through 5 of January and March'],
  ['named weekday step', '0 0 * * MON-FRI/2', 'every 2 days of the week from Monday through Friday'],
  ['Sunday as 7', '0 0 * * 7', 'Sunday'],
  ['lowercase names', '0 9 * jan mon', 'Monday in January'],
  ['complete weekday range', '0 0 * * 0-7', 'every day of the week'],
] as const)('explains a valid cron %s from parsed fields', async (_case, expression, explanation) => {
  const result = await run({ input: textInput(expression) }, { timezone: 'UTC', from: '2026-01-01T00:00:00Z' }, context);
  expect(result.kind).toBe('multi');
  if (result.kind === 'multi') {
    expect(result.parts[0]).toMatchObject({ label: 'Explanation', output: { kind: 'text', text: expect.stringContaining(explanation) } });
    if (result.parts[0]?.output.kind === 'text') expect(result.parts[0].output.text).not.toMatch(/[*/]/);
  }
});
test('accounts for daylight saving time in Europe/Berlin', async () => {
  const result = await run({ input: textInput('30 2 * * *') }, { timezone: 'Europe/Berlin', from: '2026-03-28T00:00:00Z' }, context);
  expect(result.kind).toBe('multi');
  if (result.kind === 'multi' && result.parts[1]?.output.kind === 'table') {
    expect(result.parts[1].output.rows.map(row => row[0])).not.toContain('2026-03-29T01:30:00.000Z');
  }
});
test('lists both repeated local times when daylight saving ends', async () => {
  const result = await run({ input: textInput('30 2 * * *') }, { timezone: 'Europe/Berlin', from: '2026-10-24T23:59:00Z' }, context);
  expect(result.kind).toBe('multi');
  if (result.kind === 'multi' && result.parts[1]?.output.kind === 'table') {
    expect(result.parts[1].output.rows.slice(0, 2)).toEqual([['2026-10-25T00:30:00.000Z'], ['2026-10-25T01:30:00.000Z']]);
  }
});
test('reports invalid timezone', async () => {
  expect(await run({ input: textInput('* * * * *') }, { timezone: 'Nowhere/Imaginary' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
test('finds five leap-day runs across multiple years', async () => {
  const result = await run({ input: textInput('0 0 29 2 *') }, { timezone: 'UTC', from: '2025-01-01T00:00:00Z' }, context);
  expect(result.kind).toBe('multi');
  if (result.kind === 'multi' && result.parts[1]?.output.kind === 'table') {
    expect(result.parts[1].output.rows).toEqual([
      ['2028-02-29T00:00:00.000Z'], ['2032-02-29T00:00:00.000Z'], ['2036-02-29T00:00:00.000Z'],
      ['2040-02-29T00:00:00.000Z'], ['2044-02-29T00:00:00.000Z'],
    ]);
  }
});
