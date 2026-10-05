import { expect, it } from 'vitest';
import { run } from './sort-lines.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };
const sort = (text: string, options: Record<string, string | number | boolean>) => run({ input: textInput(text) }, options, context);

it('sorts stably for equal numeric values and keeps the trailing newline', async () => {
  expect(await sort('2b\n1\n2a\n', { numeric: true, reverse: false, unique: false })).toMatchObject({ kind: 'text', text: '1\n2b\n2a\n' });
});

it('removes duplicate lines then reverses the order', async () => {
  expect(await sort('b\na\nb\n', { numeric: false, reverse: true, unique: true })).toMatchObject({ kind: 'text', text: 'b\na\n' });
});

it('keeps an empty input empty', async () => {
  expect(await sort('', { numeric: false, reverse: false, unique: false })).toMatchObject({ kind: 'text', text: '' });
});
