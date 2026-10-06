import { beforeEach, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { ToolDefinition, ToolHost, ToolOutput } from '~/lib/tools/types';
import { diff } from '~/lib/tools/transform/diff';

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

it('starts a note-default text tool from an available selection', () => {
  const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'text', text: 'result' }), host, noteContent: 'source' } });
  expect((wrapper.get('select[aria-label="Input source"]').element as HTMLSelectElement).value).toBe('selection');
  wrapper.unmount();
});

it('falls back to the note when no selection exists', () => {
  host.getSelection = () => null;
  const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'text', text: 'result' }), host, noteContent: 'source' } });
  expect((wrapper.get('select[aria-label="Input source"]').element as HTMLSelectElement).value).toBe('note');
  wrapper.unmount();
});

it('uses selection for the Diff left input and leaves the empty right input editable', () => {
  const wrapper = mount(ToolView, { props: { tool: diff, host, noteContent: 'source' } });
  expect((wrapper.get('select[aria-label="Left source"]').element as HTMLSelectElement).value).toBe('selection');
  expect((wrapper.get('select[aria-label="Right source"]').element as HTMLSelectElement).value).toBe('text');
  wrapper.unmount();
});

it('offers valid decoded UTF-8 bytes for selection replacement', async () => {
  const output: ToolOutput = { kind: 'bytes', bytes: new TextEncoder().encode('hello'), text: 'hello', filename: 'decoded.bin' };
  const wrapper = mount(ToolView, { props: { tool: resultTool(output), host, noteContent: 'source' }, global: { stubs: { ToolsMonacoOutput: true } } });
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.find('button[name="replace-selection"]').exists()).toBe(true));
  await wrapper.get('button[name="replace-selection"]').trigger('click');
  expect(host.replaceSelection).toHaveBeenCalledWith('hello');
  expect(wrapper.text()).toContain('5 bytes');
  expect(wrapper.findAll('button').some(button => button.text() === 'Download')).toBe(true);
  wrapper.unmount();
});

it('does not offer text replacement for invalid UTF-8 bytes', async () => {
  const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'bytes', bytes: new Uint8Array([255]) }), host, noteContent: 'source' } });
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.text()).toContain('1 bytes'));
  expect(wrapper.find('button[name="replace-selection"]').exists()).toBe(false);
  wrapper.unmount();
});

it('reveals a report position when the source is a note', async () => {
  const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'report', items: [{ level: 'error', message: 'bad', position: { line: 2, column: 4 } }] }), host, noteContent: 'source' } });
  await wrapper.get('select[aria-label="Input source"]').setValue('note');
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
    await wrapper.get('select[aria-label="Input source"]').setValue('note');
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

it('runs a zero-input generator only when Run is clicked', async () => {
  vi.useFakeTimers();
  try {
    const run = vi.fn(async () => ({ kind: 'text', text: 'generated' } as const));
    const tool: ToolDefinition = {
      ...resultTool({ kind: 'text', text: 'unused' }),
      id: 'generator', inputs: [], load: async () => ({ run }),
    };
    const wrapper = mount(ToolView, { props: { tool, host, noteContent: 'source' }, global: { stubs: { ToolsMonacoOutput: true } } });
    await wrapper.setProps({ noteContent: 'changed' });
    await vi.advanceTimersByTimeAsync(350);
    expect(run).not.toHaveBeenCalled();
    await wrapper.get('button[name="run"]').trigger('click');
    await vi.waitFor(() => expect(run).toHaveBeenCalledOnce());
    wrapper.unmount();
  } finally { vi.useRealTimers(); }
});

it('cancels pending note auto-run when switched to a file', async () => {
  vi.useFakeTimers();
  try {
    const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'text', text: 'result' }), host, noteContent: 'source' } });
    await wrapper.get('select[aria-label="Input source"]').setValue('note');
    await wrapper.setProps({ noteContent: 'changed' });
    await vi.advanceTimersByTimeAsync(100);
    await wrapper.get('select[aria-label="Input source"]').setValue('file');
    const file = { name: 'input.txt', size: 3, stream: vi.fn() } as unknown as File;
    const fileInput = wrapper.get('input[type="file"]');
    Object.defineProperty(fileInput.element, 'files', { value: [file] });
    await fileInput.trigger('change');
    await vi.advanceTimersByTimeAsync(300);
    expect(file.stream).not.toHaveBeenCalled();
    expect(wrapper.find('[aria-label="Tool output"]').exists()).toBe(false);
    wrapper.unmount();
  } finally { vi.useRealTimers(); }
});

it('cancels pending note auto-run when an option changes', async () => {
  vi.useFakeTimers();
  try {
    const run = vi.fn(async () => ({ kind: 'text', text: 'result' } as const));
    const tool: ToolDefinition = { ...resultTool({ kind: 'text', text: 'unused' }), options: [{ id: 'mode', label: 'Mode', type: 'text', default: '' }], load: async () => ({ run }) };
    const wrapper = mount(ToolView, { props: { tool, host, noteContent: 'source' } });
    await wrapper.get('select[aria-label="Input source"]').setValue('note');
    await wrapper.setProps({ noteContent: 'changed' });
    await wrapper.get('#option-mode').setValue('new');
    await vi.advanceTimersByTimeAsync(350);
    expect(run).not.toHaveBeenCalled();
    wrapper.unmount();
  } finally { vi.useRealTimers(); }
});

it('cancels pending note auto-run when the tool changes', async () => {
  vi.useFakeTimers();
  try {
    const run = vi.fn(async () => ({ kind: 'text', text: 'new tool' } as const));
    const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'text', text: 'old tool' }), host, noteContent: 'source' } });
    await wrapper.get('select[aria-label="Input source"]').setValue('note');
    await wrapper.setProps({ noteContent: 'changed' });
    await wrapper.setProps({ tool: { ...resultTool({ kind: 'text', text: 'unused' }), id: 'new', load: async () => ({ run }) } });
    await vi.advanceTimersByTimeAsync(350);
    expect(run).not.toHaveBeenCalled();
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
  await wrapper.get('select[aria-label="Input source"]').setValue('note');
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

it('names the tool once through its description and lays options out as label rows', () => {
  const tool: ToolDefinition = { ...resultTool({ kind: 'text', text: '' }), options: [
    { id: 'mode', label: 'Mode', type: 'select', default: 'a', values: [{ value: 'a', label: 'A' }] },
    { id: 'strict', label: 'Strict', type: 'boolean', default: false },
  ] };
  const wrapper = mount(ToolView, { props: { tool, host, noteContent: 'source' } });
  expect(wrapper.find('h2').exists()).toBe(false);
  expect(wrapper.text().split('A test tool')).toHaveLength(2);
  for (const id of ['mode', 'strict']) {
    const control = wrapper.get(`#option-${id}`);
    const label = wrapper.get(`label[for="option-${id}"]`);
    expect(label.element.parentElement).toBe(control.element.parentElement);
  }
  wrapper.unmount();
});

it('puts Run into the header row when a host supplies one', () => {
  const wrapper = mount(ToolView, {
    props: { tool: resultTool({ kind: 'text', text: '' }), host, noteContent: 'source' },
    slots: { header: '<span>Tools</span>', actions: '<button name="close">Close</button>' },
  });
  const header = wrapper.get('header');
  expect(header.text()).toContain('Tools');
  expect(header.find('button[name="run"]').exists()).toBe(true);
  expect(header.find('button[name="close"]').exists()).toBe(true);
  expect(wrapper.findAll('button[name="run"]')).toHaveLength(1);
  wrapper.unmount();
});

it('chooses a file through an outlined button and shows its name and size inline', async () => {
  const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'text', text: '' }), host, noteContent: 'source' } });
  await wrapper.get('select[aria-label="Input source"]').setValue('file');
  const fileInput = wrapper.get('input[type="file"]');
  const click = vi.spyOn(fileInput.element as HTMLInputElement, 'click');
  await wrapper.get('button[name="choose-file"]').trigger('click');
  expect(click).toHaveBeenCalledOnce();
  Object.defineProperty(fileInput.element, 'files', { value: [{ name: 'abc.txt', size: 3 }] });
  await fileInput.trigger('change');
  expect(wrapper.text()).toContain('abc.txt');
  expect(wrapper.text()).toContain('3 bytes');
  wrapper.unmount();
});

it('shows a running tool as a progress track', async () => {
  const tool: ToolDefinition = { ...resultTool({ kind: 'text', text: '' }), load: async () => ({ run: () => new Promise<never>(() => {}) }) };
  const wrapper = mount(ToolView, { props: { tool, host, noteContent: 'source' } });
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.find('[role="progressbar"]').exists()).toBe(true));
  expect(wrapper.get('[role="progressbar"]').attributes('aria-label')).toBe('Progress');
  expect(wrapper.find('progress').exists()).toBe(false);
  wrapper.unmount();
});

it('renders report items as level, position and message rows', async () => {
  const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'report', items: [{ level: 'error', message: 'bad', position: { line: 2, column: 4 } }, { level: 'info', message: 'fine' }] }), host, noteContent: 'source' } });
  await wrapper.get('select[aria-label="Input source"]').setValue('note');
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.find('button[name="reveal"]').exists()).toBe(true));
  const rows = wrapper.findAll('[data-report-item]').map(row => row.text().replace(/\s+/g, ' '));
  expect(rows).toEqual(['error: 2:4 bad', 'info: fine']);
  wrapper.unmount();
});

it('clears the previous output when the tool changes in place', async () => {
  const wrapper = mount(ToolView, { props: { tool: resultTool({ kind: 'text', text: 'old' }), host, noteContent: 'source' }, global: { stubs: { ToolsMonacoOutput: true } } });
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.find('[aria-label="Tool output"]').exists()).toBe(true));
  await wrapper.setProps({ tool: { ...resultTool({ kind: 'text', text: 'new' }), id: 'other' } });
  expect(wrapper.find('[aria-label="Tool output"]').exists()).toBe(false);
  wrapper.unmount();
});
