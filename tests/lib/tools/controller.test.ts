import { expect, it, vi } from 'vitest';
import { createToolRunner, rememberedOptions, presetOptions } from '~/lib/tools/controller';
import type { ToolDefinition, ToolOutput } from '~/lib/tools/types';

const tool: ToolDefinition = {
  id: 'example', title: 'Example', description: '', keywords: ['example'], category: 'transform',
  inputs: [{ id: 'input', label: 'Input', kind: 'text' }],
  options: [{ id: 'normal', label: 'Normal', type: 'text', default: '' }, { id: 'password', label: 'Password', type: 'text', default: '', secret: true }],
  load: async () => ({ run: async () => ({ kind: 'text', text: 'ok' }) }),
};

it('aborts a running job on option change and discards late completion', async () => {
  let finish!: (value: ToolOutput) => void;
  let signal: AbortSignal | undefined;
  let started!: () => void;
  const running = new Promise<void>(resolve => { started = resolve; });
  const slow: ToolDefinition = { ...tool, load: async () => ({ run: async (_inputs, _options, context) => {
    signal = context.signal;
    started();
    return new Promise(resolve => { finish = resolve; });
  } }) };
  const states: string[] = [];
  const runner = createToolRunner(slow, state => { states.push(state.output?.kind ?? state.error ?? 'empty'); });
  const pending = runner.run({ input: { source: 'text', text: 'one' } }, { normal: 'a' });
  await running;
  runner.invalidate();
  expect(signal?.aborted).toBe(true);
  finish({ kind: 'text', text: 'stale' });
  await pending;
  expect(runner.state.output).toBeNull();
  expect(states.at(-1)).toBe('empty');
});

it('never remembers secret values or reads them from a route query', () => {
  const options = { normal: 'visible', password: 'private' };
  expect(rememberedOptions(tool, options)).toEqual({ normal: 'visible' });
  expect(presetOptions(tool, { normal: 'query', password: 'leak', input: 'note text' })).toEqual({ normal: 'query' });
});

it('cancels a file stream when options change during text conversion', async () => {
  let started!: () => void;
  const reading = new Promise<void>(resolve => { started = resolve; });
  let cancelled = false;
  const file = { name: 'slow.txt', size: 3, stream: () => new ReadableStream<Uint8Array>({
    pull() { started(); return new Promise<void>(() => {}); },
    cancel() { cancelled = true; },
  }) } as unknown as File;
  const runner = createToolRunner(tool, () => {});
  const pending = runner.run({ input: { source: 'file', file } }, { normal: 'a' });
  await reading;
  runner.invalidate();
  await vi.waitFor(() => expect(cancelled).toBe(true), { timeout: 200 });
  await pending;
});
