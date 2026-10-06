import { expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { ToolContext, ToolDefinition } from '~/lib/tools/types';

const settings = { tools: { image: { exportFormat: 'webp', exportQuality: 82, checkerboard: true }, rememberOptions: true, lastOptions: {} } };
vi.stubGlobal('useSettingsStore', () => settings);
vi.stubGlobal('useRouter', () => ({ push: vi.fn() }));
vi.mock('~/components/tools/image-stage.vue', () => ({ default: { template: '<div />' } }));
vi.mock('~/lib/image/codecs', async importOriginal => {
  const actual = await importOriginal<typeof import('~/lib/image/codecs')>();
  return { ...actual, getCodec: (format: string) => ({ ...actual.getCodec(format as typeof actual.EXPORT_FORMATS[number]), canEncode: async () => ['png', 'jpeg', 'webp'].includes(format) }) };
});
vi.mock('~/lib/image/export', () => ({ createImageExport: () => ({ encode: async () => new Blob(['encoded'], { type: 'image/png' }), dispose() {} }) }));
const { default: ToolView } = await import('~/components/tools/tool-view.vue');

it('gives a later Run the selected export format without rerunning when the row changes', async () => {
  const run = vi.fn(async (_inputs: unknown, _options: unknown, _context: ToolContext) => ({ kind: 'image', blob: new Blob(['image'], { type: 'image/png' }), width: 1, height: 1, filename: 'image.png' } as const));
  const tool: ToolDefinition = { id: 'compress-test', title: 'Compress', description: '', keywords: [], category: 'image', heavy: true, inputs: [], options: [], load: async () => ({ run }) };
  const host = { getNote: () => null, getSelection: () => null, replaceNote: vi.fn(), replaceSelection: vi.fn(), insertAtCursor: vi.fn(), revealPosition: vi.fn() };
  const wrapper = mount(ToolView, { props: { tool, host } });
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.find('[aria-label="Export format"] button[value="jpeg"]').exists()).toBe(true));
  expect(run.mock.calls[0]?.[2].imageExportFormat).toBe('webp');
  await wrapper.get('[aria-label="Export format"] button[value="jpeg"]').trigger('click');
  await new Promise(resolve => setTimeout(resolve, 350));
  expect(run).toHaveBeenCalledTimes(1);
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(2));
  expect(run.mock.calls[1]?.[2].imageExportFormat).toBe('jpeg');
  wrapper.unmount();
});

it('aborts the completed run when the tool changes so a session can release resources', async () => {
  let signal: AbortSignal | undefined;
  const run = vi.fn(async (_inputs: unknown, _options: unknown, context: ToolContext) => {
    signal = context.signal;
    return { kind: 'text', text: 'done' } as const;
  });
  const tool: ToolDefinition = { id: 'background-test', title: 'Background', description: '', keywords: [], category: 'image', heavy: true, inputs: [], options: [], load: async () => ({ run }) };
  const next: ToolDefinition = { ...tool, id: 'next-test', load: async () => ({ run: async () => ({ kind: 'text', text: 'next' }) }) };
  const host = { getNote: () => null, getSelection: () => null, replaceNote: vi.fn(), replaceSelection: vi.fn(), insertAtCursor: vi.fn(), revealPosition: vi.fn() };
  const wrapper = mount(ToolView, { props: { tool, host } });
  await wrapper.get('button[name="run"]').trigger('click');
  await vi.waitFor(() => expect(wrapper.find('[aria-label="Tool output"]').exists()).toBe(true));
  expect(run).toHaveBeenCalledOnce();
  expect(signal?.aborted).toBe(false);
  await wrapper.setProps({ tool: next });
  expect(signal?.aborted).toBe(true);
  wrapper.unmount();
});
