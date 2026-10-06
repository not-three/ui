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

it('keeps fields introduced by later JSON rows through a CSV round trip', async () => {
  const csv = await run({ input: textInput('[{"a":1},{"b":2}]') }, { direction: 'json-csv' }, context);
  expect(csv).toMatchObject({ kind: 'text', language: 'csv' });
  if (csv.kind !== 'text') return;
  expect(csv.text.split(/\r?\n/)[0]).toBe('a,b');
  const json = await run({ input: textInput(csv.text) }, { direction: 'csv-json' }, context);
  expect(json).toMatchObject({ kind: 'text', language: 'json' });
  if (json.kind === 'text') expect(JSON.parse(json.text)).toEqual([{ a: '1', b: '' }, { a: '', b: '2' }]);
});

it('orders JSON-to-CSV columns by first appearance across rows', async () => {
  const csv = await run({ input: textInput('[{"z":1,"a":2},{"b":3,"z":4}]') }, { direction: 'json-csv' }, context);
  expect(csv).toMatchObject({ kind: 'text', language: 'csv' });
  if (csv.kind === 'text') expect(csv.text.split(/\r?\n/)[0]).toBe('z,a,b');
});

it('reports malformed CSV rows and invalid JSON', async () => {
  const csv = await run({ input: textInput('name,age\nJo,1,extra') }, { direction: 'csv-json' }, context);
  const json = await run({ input: textInput('{oops}') }, { direction: 'json-csv' }, context);
  expect(csv).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 2 } }] });
  expect(json).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});

it.each([
  ['quoted Unicode', 'name,note\n"Zoë","a,b"', '"Zoë"'],
  ['embedded newline', 'name,note\nA,"one\ntwo"', 'one\\ntwo'],
  ['empty cell', 'name,note\nA,', '"note": ""'],
])('preserves CSV %s values', async (_name, source, expected) => {
  const result = await run({ input: textInput(source) }, { direction: 'csv-json' }, context);
  expect(result).toMatchObject({ kind: 'text', language: 'json' });
  if (result.kind === 'text') expect(result.text).toContain(expected);
});

it.each(['{"name":"A"}', '[1,2]', '{oops}'])('rejects JSON-to-CSV input that is not an object array: %s', async source => {
  expect(await run({ input: textInput(source) }, { direction: 'json-csv' }, context)).toMatchObject({ kind: 'report', items: [{ level: 'error' }] });
});
