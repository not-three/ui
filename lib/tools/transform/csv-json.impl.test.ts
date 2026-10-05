import { expect, it } from 'vitest';
import { run } from './csv-json.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };

it('parses headers, quoted commas, embedded newlines and Unicode', async () => {
  const result = await run({ input: textInput('name,note\n"Zoë","hello,\nworld"\n東京,ok') }, { direction: 'csv-json' }, context);
  expect(result).toMatchObject({ kind: 'text', language: 'json' });
  if (result.kind === 'text') expect(JSON.parse(result.text)).toEqual([{ name: 'Zoë', note: 'hello,\nworld' }, { name: '東京', note: 'ok' }]);
});

it('quotes JSON fields when converting to CSV', async () => {
  const result = await run({ input: textInput('[{"name":"Zoë","note":"hello,\\nworld"}]') }, { direction: 'json-csv' }, context);
  expect(result).toMatchObject({ kind: 'text', language: 'csv' });
  if (result.kind === 'text') expect(result.text).toContain('"hello,\nworld"');
});

it('reports malformed CSV rows and invalid JSON', async () => {
  const csv = await run({ input: textInput('name,age\nJo,1,extra') }, { direction: 'csv-json' }, context);
  const json = await run({ input: textInput('{oops}') }, { direction: 'json-csv' }, context);
  expect(csv).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 2 } }] });
  expect(json).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
