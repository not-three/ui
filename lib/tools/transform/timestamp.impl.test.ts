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
