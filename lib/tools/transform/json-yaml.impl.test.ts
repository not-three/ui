import { expect, it } from 'vitest';
import { run } from './json-yaml.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };

it('converts nested JSON arrays and Unicode to YAML', async () => {
  const result = await run({ input: textInput('{"people":[{"name":"Zoë","active":true}],"count":2}') }, { direction: 'json-yaml' }, context);
  expect(result).toMatchObject({ kind: 'text', language: 'yaml' });
  if (result.kind !== 'text') return;
  expect(result.text).toContain('Zoë');
  expect(result.text).toContain('active: true');
});

it('converts YAML arrays and Unicode to JSON', async () => {
  const result = await run({ input: textInput('people:\n  - name: 東京\n    active: true\n') }, { direction: 'yaml-json' }, context);
  expect(result).toMatchObject({ kind: 'text', language: 'json' });
  if (result.kind === 'text') expect(JSON.parse(result.text)).toEqual({ people: [{ name: '東京', active: true }] });
});

it('reports JSON and YAML syntax positions', async () => {
  const json = await run({ input: textInput('{\n"a":,\n}') }, { direction: 'json-yaml' }, context);
  const yaml = await run({ input: textInput('a: [1,\n') }, { direction: 'yaml-json' }, context);
  expect(json).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 2 } }] });
  expect(yaml).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 2 } }] });
});
