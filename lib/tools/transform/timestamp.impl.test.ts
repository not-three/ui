import { expect, it } from 'vitest';
import { run } from './timestamp.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };
const convert = (text: string, format: string, timezone = 'UTC') => run({ input: textInput(text) }, { format, timezone }, context);

it('converts epoch to ISO and RFC in UTC', async () => {
  expect(await convert('0', 'iso')).toMatchObject({ kind: 'text', text: '1970-01-01T00:00:00+00:00' });
  expect(await convert('0', 'rfc')).toMatchObject({ kind: 'text', text: 'Thu, 01 Jan 1970 00:00:00 +0000' });
});

it('converts ISO with offset across a date boundary to Unix seconds', async () => {
  expect(await convert('1970-01-01T01:00:00+01:00', 'unix')).toMatchObject({ kind: 'text', text: '0' });
  expect(await convert('0', 'iso', 'America/Los_Angeles')).toMatchObject({ kind: 'text', text: '1969-12-31T16:00:00-08:00' });
});

it('uses daylight saving offsets for IANA timezones', async () => {
  expect(await convert('2024-07-01T00:00:00Z', 'iso', 'Europe/Berlin')).toMatchObject({ kind: 'text', text: '2024-07-01T02:00:00+02:00' });
  expect(await convert('2024-01-01T00:00:00Z', 'iso', 'Europe/Berlin')).toMatchObject({ kind: 'text', text: '2024-01-01T01:00:00+01:00' });
});

it('rejects invalid dates and timezones', async () => {
  expect(await convert('not a date', 'iso')).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
  expect(await convert('0', 'iso', 'Nowhere/Invalid')).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});

it('rejects impossible ISO calendar dates without rolling into another month', async () => {
  expect(await convert('2024-02-30T00:00:00Z', 'iso')).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
  expect(await convert('2023-02-29T12:00:00+01:00', 'unix')).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
  expect(await convert('2024-02-29T00:00:00Z', 'unix')).toMatchObject({ kind: 'text', text: '1709164800' });
});

it('rejects impossible RFC dates and accepts a valid leap day', async () => {
  expect(await convert('Fri, 30 Feb 2024 00:00:00 GMT', 'iso')).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
  expect(await convert('Thu, 29 Feb 2024 00:00:00 GMT', 'unix')).toMatchObject({ kind: 'text', text: '1709164800' });
});

it.each([
  ['valid RFC3339 leap day', '2024-02-29T23:30:00+01:00', '1709245800'],
  ['valid RFC2822 leap day', 'Thu, 29 Feb 2024 00:00:00 +0000', '1709164800'],
  ['offset crosses day boundary', '1970-01-01T01:00:00+01:00', '0'],
])('accepts %s', async (_name, source, expected) => {
  expect(await convert(source, 'unix')).toMatchObject({ kind: 'text', text: expected });
});

it.each([
  ['non-leap RFC3339 day', '2023-02-29T00:00:00Z'],
  ['24:00 RFC3339 time', '2024-01-01T24:00:00Z'],
  ['impossible RFC2822 day', 'Fri, 30 Feb 2024 00:00:00 GMT'],
  ['wrong RFC2822 weekday', 'Fri, 29 Feb 2024 00:00:00 GMT'],
])('rejects %s', async (_name, source) => {
  expect(await convert(source, 'iso')).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
