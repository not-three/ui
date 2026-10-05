import { expect, it } from 'vitest';
import { run } from './text-stats.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };

it('counts Unicode code points, words, lines and UTF-8 bytes', async () => {
  expect(await run({ input: textInput('Hi 🌍\n東京') }, {}, context)).toEqual({ kind: 'table', columns: ['Metric', 'Value'], rows: [['Characters', 7], ['Words', 2], ['Lines', 2], ['UTF-8 bytes', 14], ['Reading time (minutes)', 0.01]] });
});

it('reports zero values for empty text', async () => {
  expect(await run({ input: textInput('') }, {}, context)).toEqual({ kind: 'table', columns: ['Metric', 'Value'], rows: [['Characters', 0], ['Words', 0], ['Lines', 0], ['UTF-8 bytes', 0], ['Reading time (minutes)', 0]] });
});
