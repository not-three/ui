import { resolveInput, type SourceValue } from './input';
import type { ToolContext, ToolDefinition, ToolInput, ToolOptionValue, ToolOutput } from './types';

export interface ToolRunState { output: ToolOutput | null; inputImage?: Extract<ToolInput, {kind: 'image'}> | null; error: string | null; progress: number; running: boolean }

export function rememberedOptions(tool: ToolDefinition, options: Record<string, ToolOptionValue>): Record<string, ToolOptionValue> {
  return Object.fromEntries(tool.options.filter(spec => !spec.secret && Object.hasOwn(options, spec.id)).map(spec => [spec.id, options[spec.id]!])) as Record<string, ToolOptionValue>;
}

export function presetOptions(tool: ToolDefinition, query: Record<string, unknown>): Record<string, ToolOptionValue> {
  const values: Record<string, ToolOptionValue> = {};
  for (const spec of tool.options) {
    if (spec.secret) continue;
    const raw = query[spec.id];
    if (typeof raw !== 'string') continue;
    if (spec.type === 'select' && spec.values.some(item => item.value === raw)) values[spec.id] = raw;
    else if (spec.type === 'boolean' && (raw === 'true' || raw === 'false')) values[spec.id] = raw === 'true';
    else if (spec.type === 'number' && Number.isFinite(Number(raw))) values[spec.id] = Number(raw);
    else if (spec.type === 'text') values[spec.id] = raw;
  }
  return values;
}

export function createToolRunner(tool: ToolDefinition, onUpdate: (state: ToolRunState) => void) {
  let sequence = 0;
  let controller: AbortController | null = null;
  const state: ToolRunState = { output: null, error: null, progress: 0, running: false };
  const update = (patch: Partial<ToolRunState>) => { Object.assign(state, patch); onUpdate({ ...state }); };
  function invalidate(clearInput = false) {
    sequence++;
    controller?.abort();
    controller = null;
    if (clearInput) state.inputImage?.bitmap.close?.();
    update({ output: null, ...(clearInput ? { inputImage: null } : {}), error: null, progress: 0, running: false });
  }
  async function run(sources: Record<string, SourceValue>, options: Record<string, ToolOptionValue>, contextExtras: Pick<ToolContext, 'imageExportFormat'> = {}) {
    invalidate();
    const own = sequence;
    controller = new AbortController();
    const signal = controller.signal;
    update({ running: true });
    try {
      const inputs = Object.fromEntries(await Promise.all(tool.inputs.map(async spec => {
        const value = sources[spec.id];
        if (!value) {
          if (spec.optional) return [spec.id, { kind: 'text', text: '' }];
          throw new Error(`${spec.label} is required`);
        }
        return [spec.id, await resolveInput(spec, value, signal)];
      }))) as Record<string, ToolInput>;
      if (signal.aborted) return;
      const inputImage = Object.values(inputs).find(value => value.kind === 'image') as Extract<ToolInput, {kind: 'image'}> | undefined;
      if (inputImage) {
        if (state.inputImage && state.inputImage.bitmap !== inputImage.bitmap) state.inputImage.bitmap.close?.();
        update({ inputImage });
      }
      const module = await tool.load();
      if (signal.aborted) return;
      const output = await module.run(inputs, options, { ...contextExtras, signal, reportProgress: progress => {
        if (own === sequence && !signal.aborted) update({ progress: Math.max(0, Math.min(1, progress)) });
      } });
      if (own === sequence && !signal.aborted) update({ output, progress: 1, running: false });
    } catch (error) {
      if (own === sequence && !signal.aborted) update({ error: error instanceof Error ? error.message : String(error), running: false });
    }
  }
  return { state, run, invalidate, dispose: () => invalidate(true) };
}
