import { beforeEach, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { ToolDefinition, ToolHost, ToolOutput } from '~/lib/tools/types';

const settings = { tools: { rememberOptions: true, lastOptions: {} as Record<string, Record<string, string | number | boolean>> } };
vi.stubGlobal('useSettingsStore', () => settings);
const { default: ToolView } = await import('~/components/tools/tool-view.vue');

const resultTool = (output: ToolOutput): ToolDefinition => ({
  id: 'test', title: 'Test', description: 'A test tool', keywords: ['sample'], category: 'transform',
  inputs: [{ id: 'input', label: 'Input', kind: 'text', defaultSource: 'note' }], options: [],
  load: async () => ({ run: async () => output }),
});

let host: ToolHost;
beforeEach(() => {
  settings.tools.lastOptions = {};
  host = {
    getNote: () => ({ text: 'source', language: 'json' }), getSelection: () => ({ text: 'selected' }),
    replaceNote: vi.fn(), replaceSelection: vi.fn(), insertAtCursor: vi.fn(), revealPosition: vi.fn(),
  };
});

it('offers four sources and replaces an editor selection with text output', async () => {
  const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'text', text: 'result' }), host, noteContent: 'source' }, global: { stubs: { ToolsMonacoOutput: true } } });
  const picker = wrapper.get('select[aria-label="Input source"]');
  expect(picker.findAll('option').map(option => option.text())).toEqual(['Note', 'Selection', 'File', 'Text']);
  await picker.setValue('selection');
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.find('button[name="replace-selection"]').exists()).toBe(true));
  await wrapper.get('button[name="replace-selection"]').trigger('click');
  expect(host.replaceSelection).toHaveBeenCalledWith('result');
  wrapper.unmount();
});

it('reveals a report position when the source is a note', async () => {
  const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'report', items: [{ level: 'error', message: 'bad', position: { line: 2, column: 4 } }] }), host, noteContent: 'source' } });
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.find('button[name="reveal"]').exists()).toBe(true));
  await wrapper.get('button[name="reveal"]').trigger('click');
  expect(host.revealPosition).toHaveBeenCalledWith({ line: 2, column: 4 });
  wrapper.unmount();
});

it('rejects an oversized file inline before reading it', async () => {
  const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'text', text: 'unused' }), host, noteContent: 'source' } });
  await wrapper.get('select[aria-label="Input source"]').setValue('file');
  const file = { name: 'huge.txt', size: 16 * 1024 * 1024 + 1, stream: vi.fn() } as unknown as File;
  const fileInput = wrapper.get('input[type="file"]');
  Object.defineProperty(fileInput.element, 'files', { value: [file] });
  await fileInput.trigger('change');
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.text()).toContain('this tool needs text; file too large'));
  expect(file.stream).not.toHaveBeenCalled();
  wrapper.unmount();
});

it('keeps secret options out of remembered settings', async () => {
  const tool: ToolDefinition = { ...resultTool({ kind: 'text', text: 'ok' }), options: [
    { id: 'mode', label: 'Mode', type: 'text', default: '' },
    { id: 'key', label: 'Key', type: 'text', default: '', secret: true },
  ] };
  const wrapper = mount(ToolView, { props: { tool, host, noteContent: 'source' }, global: { stubs: { ToolsMonacoOutput: true } } });
  await wrapper.get('#option-mode').setValue('normal');
  await wrapper.get('#option-key').setValue('private');
  expect(settings.tools.lastOptions.test).toEqual({ mode: 'normal' });
  wrapper.unmount();
});

it('shows report text beside diagnostics for combined output', async () => {
  const tool = resultTool({ kind: 'report', items: [{ level: 'info', message: 'decoded' }], text: '{"sub":"a"}', language: 'json' });
  const wrapper = mount(ToolView, { props: { tool, host, noteContent: 'source' }, global: { stubs: { ToolsMonacoOutput: true } } });
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.find('tools-monaco-output-stub').exists()).toBe(true));
  expect(wrapper.text()).toContain('decoded');
  wrapper.unmount();
});

it('auto-runs changed note text after 300 ms but never auto-runs a file', async () => {
  vi.useFakeTimers();
  try {
    const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'text', text: 'result' }), host, noteContent: 'source' }, global: { stubs: { ToolsMonacoOutput: true } } });
    await wrapper.setProps({ noteContent: 'changed' });
    await vi.advanceTimersByTimeAsync(299);
    expect(wrapper.find('[aria-label="Tool output"]').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[aria-label="Tool output"]').exists()).toBe(true);
    await wrapper.get('select[aria-label="Input source"]').setValue('file');
    await wrapper.setProps({ noteContent: 'changed again' });
    await vi.advanceTimersByTimeAsync(350);
    expect(wrapper.find('[aria-label="Tool output"]').exists()).toBe(false);
    wrapper.unmount();
  } finally { vi.useRealTimers(); }
});

it('renders labelled report and diff parts with their own actions', async () => {
  const multi = { kind: 'multi', parts: [
    { label: 'Matches', output: { kind: 'report', items: [{ level: 'info', message: 'match', position: { line: 1, column: 2 } }] } },
    { label: 'Replacement', output: { kind: 'diff', left: 'old', right: 'new' } },
  ] } as const;
  const wrapper = mount(ToolView, { props: { tool: resultTool(multi as never), host, noteContent: 'source' }, global: { stubs: { ToolsMonacoOutput: true } } });
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.text()).toContain('Replacement'));
  expect(wrapper.text()).toContain('Matches');
  await wrapper.get('button[name="reveal"]').trigger('click');
  expect(host.revealPosition).toHaveBeenCalledWith({ line: 1, column: 2 });
  await wrapper.get('button[name="take-right"]').trigger('click');
  expect(host.replaceNote).toHaveBeenCalledWith('new');
  wrapper.unmount();
});

it('passes numeric options to tools as numbers', async () => {
  const tool: ToolDefinition = { ...resultTool({ kind: 'text', text: '' }), options: [{ id: 'count', label: 'Count', type: 'number', default: 1 }],
    load: async () => ({ run: async (_inputs, options) => ({ kind: 'text', text: `${typeof options.count}:${options.count}` }) }) };
  const wrapper = mount(ToolView, { props: { tool, host, noteContent: 'source' }, global: { stubs: { ToolsMonacoOutput: true } } });
  await wrapper.get('#option-count').setValue('3');
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(settings.tools.lastOptions.test).toEqual({ count: 3 }));
  wrapper.unmount();
});

it('opens a standalone report text in a new note', async () => {
  const pageHost: ToolHost = { ...host, getNote: () => null, getSelection: () => null, createNote: vi.fn() };
  const tool = resultTool({ kind: 'report', items: [{ level: 'info', message: 'decoded' }], text: '{"sub":"a"}', language: 'json' });
  const wrapper = mount(ToolView, { props: { tool, host: pageHost }, global: { stubs: { ToolsMonacoOutput: true } } });
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.findAll('button').some(button => button.text() === 'Open in editor')).toBe(true));
  await wrapper.findAll('button').find(button => button.text() === 'Open in editor')!.trigger('click');
  expect(pageHost.createNote).toHaveBeenCalledWith('{"sub":"a"}', 'json');
  wrapper.unmount();
});
