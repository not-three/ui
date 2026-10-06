import { expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { ToolContext, ToolDefinition } from '~/lib/tools/types';

const settings = { tools: { image: { exportFormat: 'webp', exportQuality: 82, checkerboard: true }, rememberOptions: true, lastOptions: {} } };
vi.stubGlobal('useSettingsStore', () => settings);
vi.stubGlobal('useRouter', () => ({ push: vi.fn() }));
vi.mock('~/components/tools/image-stage.vue', () => ({ default: { name: 'ToolsImageStage', template: '<div />' } }));
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

it('clears a crop rectangle when the image source changes', async () => {
  const createImageBitmap = vi.fn(async () => ({ width: 4, height: 4, close() {} }));
  vi.stubGlobal('createImageBitmap', createImageBitmap);
  try {
    const regions: unknown[] = [];
    const tool: ToolDefinition = {
      id: 'crop-test', title: 'Crop', description: '', keywords: [], category: 'image',
      inputs: [{ id: 'input', label: 'Image', kind: 'image', stage: 'crop' }], options: [],
      load: async () => ({ run: async inputs => {
        regions.push(inputs.input?.kind === 'image' ? inputs.input.region : undefined);
        return { kind: 'text', text: 'ok' };
      } }),
    };
    const host = { getNote: () => null, getSelection: () => null, replaceNote: vi.fn(), replaceSelection: vi.fn(), insertAtCursor: vi.fn(), revealPosition: vi.fn() };
    const wrapper = mount(ToolView, { props: { tool, host } });
    const png = new Uint8Array(24);
    png.set([137, 80, 78, 71, 13, 10, 26, 10]);
    new DataView(png.buffer).setUint32(16, 4);
    new DataView(png.buffer).setUint32(20, 4);
    const dataUrl = (suffix: string) => `data:image/png;base64,${btoa(String.fromCharCode(...png, ...new TextEncoder().encode(suffix)))}`;
    await wrapper.get('textarea').setValue(dataUrl('first'));
    await wrapper.get('button[name="run"]').trigger('click');
    await vi.waitFor(() => expect(regions).toHaveLength(1));
    wrapper.findComponent({ name: 'ToolsImageStage' }).vm.$emit('update:value', { x: 1, y: 1, width: 2, height: 2 });
    await wrapper.vm.$nextTick();
    await wrapper.get('textarea').setValue(dataUrl('second'));
    await wrapper.get('button[name="run"]').trigger('click');
    await vi.waitFor(() => expect(regions).toHaveLength(2));
    expect(regions[1]).toBeUndefined();
    wrapper.unmount();
  } finally { vi.unstubAllGlobals(); }
});
