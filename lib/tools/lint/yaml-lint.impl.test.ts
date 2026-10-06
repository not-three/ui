import { expect, test } from 'vitest';
import { run } from './yaml-lint.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };
test('accepts YAML mappings', async () => {
  expect(await run({ input: textInput('name: Ada\ncount: 2') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'success' }] });
});
test('reports parser position for malformed YAML', async () => {
  expect(await run({ input: textInput('name: Ada\nitems: [a, b') }, {}, context)).toMatchObject({ kind: 'report', items: [{ level: 'error', position: { line: 2, column: 13 } }] });
});
