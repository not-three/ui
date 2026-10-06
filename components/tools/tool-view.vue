<template>
  <section class="h-full min-h-0 flex flex-col gap-3 overflow-auto p-3 text-white bg-zinc-900" role="region" :aria-label="`${tool.title} tool`">
    <header>
      <h2 class="text-lg font-semibold">{{ tool.title }}</h2>
      <p class="text-sm text-zinc-300">{{ tool.description }}</p>
    </header>
    <div v-for="spec in tool.inputs" :key="spec.id" class="flex flex-col gap-1">
      <label :for="`source-${spec.id}`">{{ spec.label }}</label>
      <select :id="`source-${spec.id}`" v-model="sources[spec.id]" :aria-label="`${spec.label} source`" class="tool-control">
        <option value="note" :disabled="!host.getNote()">Note</option>
        <option value="selection" :disabled="!host.getSelection()">Selection</option>
        <option value="file">File</option>
        <option value="text">Text</option>
      </select>
      <textarea v-if="sources[spec.id] === 'text'" v-model="texts[spec.id]" :aria-label="`${spec.label} text`" class="tool-control min-h-24 font-mono" />
      <template v-if="sources[spec.id] === 'file'">
        <input type="file" :aria-label="`${spec.label} file`" @change="chooseFile(spec.id, $event)">
        <span v-if="files[spec.id]" class="text-sm">{{ files[spec.id]?.name }} ({{ files[spec.id]?.size }} bytes)</span>
      </template>
    </div>
    <div v-for="option in tool.options" :key="option.id" class="flex flex-col gap-1">
      <label :for="`option-${option.id}`">{{ option.label }}</label>
      <select v-if="option.type === 'select'" :id="`option-${option.id}`" v-model="options[option.id]" class="tool-control" @keydown.enter.prevent="run">
        <option v-for="value in option.values" :key="value.value" :value="value.value">{{ value.label }}</option>
      </select>
      <input v-else-if="option.type === 'boolean'" :id="`option-${option.id}`" v-model="options[option.id]" type="checkbox" @keydown.enter.prevent="run">
      <input v-else :id="`option-${option.id}`" v-model="options[option.id]" :type="option.type === 'number' ? 'number' : option.secret ? 'password' : 'text'" :placeholder="option.type === 'text' ? option.placeholder : undefined" class="tool-control" @keydown.enter.prevent="run">
    </div>
    <div class="flex items-center gap-3">
      <button name="run" class="tool-button" :disabled="state.running" @click="run">{{ state.running ? 'Running…' : 'Run' }}</button>
      <progress v-if="state.running" :value="state.progress" max="1" aria-label="Progress" class="flex-grow" />
    </div>
    <p v-if="state.error" class="text-red-300" role="alert">{{ state.error }}</p>
    <tools-output v-if="state.output" :output="state.output" :host="host" :tool-id="tool.id" :note-source="noteSource" :selection-source="selectionSource" />
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { createToolRunner, presetOptions, rememberedOptions, type ToolRunState } from '~/lib/tools/controller';
import type { SourceValue } from '~/lib/tools/input';
import type { ToolDefinition, ToolHost, ToolOptionValue, ToolSource } from '~/lib/tools/types';
import ToolsOutput from './output.vue';

const props = defineProps<{ tool: ToolDefinition; host: ToolHost; noteContent?: string; presets?: Record<string, unknown> }>();
const settings = useSettingsStore();
const sources = reactive<Record<string, ToolSource>>({});
const texts = reactive<Record<string, string>>({});
const files = reactive<Record<string, File | undefined>>({});
const options = reactive<Record<string, ToolOptionValue>>({});
const state = ref<ToolRunState>({ output: null, error: null, progress: 0, running: false });
let runner = createToolRunner(props.tool, value => { state.value = value; });
let autoRunTimer: ReturnType<typeof setTimeout> | null = null;

function cancelAutoRun() { if (autoRunTimer) clearTimeout(autoRunTimer); autoRunTimer = null; }
function canAutoRun() { return props.tool.inputs.length > 0 && props.tool.inputs.every(spec => spec.kind === 'text' && sources[spec.id] === 'note'); }
function resetTool() {
  cancelAutoRun();
  runner.dispose();
  runner = createToolRunner(props.tool, value => { state.value = value; });
  for (const key of Object.keys(sources)) Reflect.deleteProperty(sources, key);
  for (const key of Object.keys(texts)) Reflect.deleteProperty(texts, key);
  for (const key of Object.keys(files)) Reflect.deleteProperty(files, key);
  for (const key of Object.keys(options)) Reflect.deleteProperty(options, key);
  for (const spec of props.tool.inputs) {
    sources[spec.id] = spec.defaultSource !== 'empty' && props.host.getSelection() ? 'selection' : spec.defaultSource !== 'empty' && props.host.getNote() ? 'note' : 'text';
    texts[spec.id] = '';
  }
  const memory = settings.tools.rememberOptions ? settings.tools.lastOptions[props.tool.id] ?? {} : {};
  const presets = presetOptions(props.tool, props.presets ?? {});
  for (const spec of props.tool.options) options[spec.id] = presets[spec.id] ?? memory[spec.id] ?? spec.default;
}
resetTool();
watch(() => props.tool, resetTool);

watch([sources, texts, files], () => { cancelAutoRun(); runner.invalidate(); }, { deep: true });
watch(options, () => {
  cancelAutoRun();
  runner.invalidate();
  if (settings.tools.rememberOptions) settings.tools.lastOptions[props.tool.id] = rememberedOptions(props.tool, options);
}, { deep: true });

watch(() => props.noteContent, () => {
  runner.invalidate();
  cancelAutoRun();
  if (canAutoRun()) autoRunTimer = setTimeout(() => { autoRunTimer = null; if (canAutoRun()) void run(); }, 300);
});
onBeforeUnmount(() => { cancelAutoRun(); runner.dispose(); });

function chooseFile(id: string, event: Event) { files[id] = (event.target as HTMLInputElement).files?.[0]; }
function sourceValues(): Record<string, SourceValue> {
  return Object.fromEntries(props.tool.inputs.map(spec => {
    const source = sources[spec.id] ?? 'text';
    const note = props.host.getNote();
    const selection = props.host.getSelection();
    return [spec.id, source === 'file' ? { source, file: files[spec.id] }
      : source === 'note' ? { source, text: note?.text ?? '', language: note?.language }
      : source === 'selection' ? { source, text: selection?.text ?? '', language: selection?.language ?? note?.language }
      : { source, text: texts[spec.id] ?? '' }];
  }));
}
async function run() { await runner.run(sourceValues(), { ...options }); }

const noteSource = computed(() => props.tool.inputs.some(spec => sources[spec.id] === 'note'));
const selectionSource = computed(() => props.tool.inputs.some(spec => sources[spec.id] === 'selection'));
</script>

<style scoped>
.tool-control { @apply bg-zinc-800 border border-zinc-500 rounded px-2 py-1 text-white; }
.tool-button { @apply bg-zinc-700 hover:bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-white; }
</style>
