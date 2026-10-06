<template>
  <section class="h-full min-h-0 flex flex-col bg-[#111] text-white text-sm" role="region" :aria-label="`${tool.title} tool`" @dragover="onDragOver" @drop="onDrop" @paste="onPaste">
    <header v-if="$slots.header" class="flex items-center gap-3 px-2 py-1 bg-black text-sm flex-wrap">
      <slot name="header" />
      <div class="flex-grow" />
      <button name="run" class="panel-btn" :disabled="state.running" @click="run">{{ state.running ? 'Running…' : 'Run' }}</button>
      <slot name="actions" />
    </header>
    <p class="text-xs text-white/60 px-2 py-1 border-b border-white/20">{{ tool.description }}</p>
    <div class="flex-grow min-h-0 overflow-auto p-2 flex flex-col gap-2">
      <div v-if="tool.inputs.length || tool.options.length" class="flex flex-col gap-1">
        <div v-for="spec in tool.inputs" :key="spec.id" class="flex flex-col gap-1">
          <div class="flex items-center gap-2 min-w-0 flex-wrap">
            <span :id="`source-${spec.id}-label`" class="tool-label">{{ spec.label }}</span>
            <tools-segmented
              v-model="sources[spec.id]"
              :label="`${spec.label} source`"
              :items="[
                { value: 'note', label: 'Note', disabled: !host.getNote() },
                { value: 'selection', label: 'Selection', disabled: !host.getSelection() },
                { value: 'file', label: 'File' },
                { value: 'text', label: 'Text' },
              ]"
            />
            <template v-if="sources[spec.id] === 'file'">
              <button type="button" name="choose-file" class="panel-btn text-xs py-0.5" @click="fileInputs[spec.id]?.click()">Choose file</button>
              <input :ref="element => { fileInputs[spec.id] = element as HTMLInputElement | null }" type="file" class="sr-only" tabindex="-1" :aria-label="`${spec.label} file`" @change="chooseFile(spec.id, $event)">
              <span class="text-xs text-white/60 truncate min-w-0">{{ files[spec.id] ? `${files[spec.id]?.name} (${files[spec.id]?.size} bytes)` : 'No file chosen' }}</span>
            </template>
          </div>
          <textarea v-if="sources[spec.id] === 'text'" v-model="texts[spec.id]" :aria-label="`${spec.label} text`" class="panel-input font-mono min-h-24 w-full resize-y" />
        </div>
        <div v-for="option in tool.options" :key="option.id" class="flex items-center gap-2 min-w-0 flex-wrap">
          <label v-if="option.type !== 'select' || option.values.length > SEGMENTED_MAX" :for="`option-${option.id}`" class="tool-label">{{ option.label }}</label>
          <span v-else class="tool-label">{{ option.label }}</span>
          <tools-segmented v-if="option.type === 'select' && option.values.length <= SEGMENTED_MAX" :model-value="String(options[option.id])" :label="option.label" :items="option.values" @update:model-value="options[option.id] = $event" />
          <select v-else-if="option.type === 'select'" :id="`option-${option.id}`" v-model="options[option.id]" class="panel-select" @keydown.enter.prevent="run">
            <option v-for="value in option.values" :key="value.value" :value="value.value">{{ value.label }}</option>
          </select>
          <input v-else-if="option.type === 'boolean'" :id="`option-${option.id}`" v-model="options[option.id]" type="checkbox" @keydown.enter.prevent="run">
          <input v-else :id="`option-${option.id}`" v-model="options[option.id]" :type="option.type === 'number' ? 'number' : option.secret ? 'password' : 'text'" :placeholder="option.type === 'text' ? option.placeholder : undefined" :min="option.type === 'number' ? option.min : undefined" :max="option.type === 'number' ? option.max : undefined" class="panel-input flex-grow min-w-0" :class="option.type === 'number' ? 'max-w-32' : ''" @keydown.enter.prevent="run">
        </div>
        <div v-if="state.inputImage" class="flex flex-col gap-1">
          <p v-if="state.inputImage.firstFrameOnly" class="text-white/60 text-xs">Animated image: using the first frame.</p>
          <tools-image-stage :blob="inputPreviewBlob" :width="state.inputImage.width" :height="state.inputImage.height" :mode="imageStageMode" :aspect="stageAspect" :value="stageValue" :checkerboard="settings.tools.image.checkerboard" @update:value="stageValue = $event" @file="acceptImageFile" @paste="acceptImageText" />
        </div>
      </div>
      <div v-if="!$slots.header" class="flex items-center gap-2">
        <button name="run" class="panel-btn" :disabled="state.running" @click="run">{{ state.running ? 'Running…' : 'Run' }}</button>
        <span v-if="autoRunEnabled" class="text-xs text-white/40 select-none">Runs automatically as the input changes</span>
      </div>
      <div v-if="state.running" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="1" :aria-valuenow="state.progress" class="h-1.5 border border-white/40 flex-shrink-0">
        <div class="h-full bg-white" :style="{ width: `${state.progress * 100}%` }" />
      </div>
      <p v-if="state.error" class="text-red-400 text-xs" role="alert">{{ state.error }}</p>
      <tools-output v-if="state.output" :output="state.output" :host="host" :tool-id="tool.id" :note-source="noteSource" :selection-source="selectionSource" :input-image="state.inputImage" :image-export-format="imageExportFormat" class="flex-grow" @update:image-export-format="imageExportFormat = $event" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, shallowRef, ref, watch } from 'vue';
import { createToolRunner, presetOptions, rememberedOptions, type ToolRunState } from '~/lib/tools/controller';
import { EXPORT_FORMATS, getCodec, type ImageFormat } from '~/lib/image/codecs';
import { takeHandoff } from '~/lib/tools/handoff';
import type { SourceValue } from '~/lib/tools/input';
import type { ImagePoint, ImageRegion, ToolDefinition, ToolHost, ToolOptionValue, ToolSource } from '~/lib/tools/types';
import ToolsOutput from './output.vue';
import ToolsSegmented from './segmented.vue';
import ToolsImageStage from './image-stage.vue';

/** Select options with at most this many values render as a button group instead of a dropdown. */
const SEGMENTED_MAX = 4;
/** Delay between the last input change and an automatic run. */
const AUTO_RUN_DELAY = 300;

const props = defineProps<{ tool: ToolDefinition; host: ToolHost; noteContent?: string; presets?: Record<string, unknown> }>();
const settings = useSettingsStore();
const sources = reactive<Record<string, ToolSource>>({});
const texts = reactive<Record<string, string>>({});
const files = reactive<Record<string, File | undefined>>({});
const fileInputs: Record<string, HTMLInputElement | null> = {};
const options = reactive<Record<string, ToolOptionValue>>({});
const state = shallowRef<ToolRunState>({ output: null, error: null, progress: 0, running: false });
const stageValue = ref<ImageRegion | ImagePoint>();
const imageExportFormat = ref<ImageFormat>(settings.tools.image.exportFormat as ImageFormat);
const imageStageMode = computed(() => props.tool.inputs.find(spec => spec.kind === 'image')?.stage ?? 'view');
const stageAspect = computed(() => {
  if (imageStageMode.value !== 'crop') return undefined;
  const choice = String(options.aspect ?? 'free').toLowerCase();
  const ratio = choice === 'custom' ? String(options.customRatio ?? '') : choice;
  const match = ratio.match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/);
  return match && Number(match[2]) > 0 ? Number(match[1]) / Number(match[2]) : undefined;
});
const inputPreviewBlob = computed(() => state.value.inputImage ? new Blob([state.value.inputImage.bytes as BlobPart], { type: state.value.inputImage.mimeType }) : undefined);
let runner = createToolRunner(props.tool, value => { state.value = value; });
let autoRunTimer: ReturnType<typeof setTimeout> | null = null;

function cancelAutoRun() { if (autoRunTimer) clearTimeout(autoRunTimer); autoRunTimer = null; }

/**
 * Tools re-run on their own while every input comes from the note, the
 * selection or pasted text. Files are never read without an explicit Run,
 * zero-input generators only run on demand (a new UUID on every keystroke
 * would be noise), and tools with a secret option wait for Run so a
 * half-typed password does not produce a stream of errors.
 */
const autoRunEnabled = computed(() =>
  props.tool.inputs.length > 0
  && !props.tool.heavy
  && !props.tool.options.some(option => option.secret)
  && props.tool.inputs.every(spec => sources[spec.id] !== 'file'),
);
function autoRunReady() {
  if (!autoRunEnabled.value) return false;
  const values = sourceValues();
  return props.tool.inputs.every(spec => spec.optional || !!values[spec.id]?.text);
}
function scheduleAutoRun() {
  cancelAutoRun();
  if (!autoRunReady()) return;
  autoRunTimer = setTimeout(() => { autoRunTimer = null; if (autoRunReady()) void run(); }, AUTO_RUN_DELAY);
}

function resetTool() {
  cancelAutoRun();
  runner.dispose();
  runner = createToolRunner(props.tool, value => { state.value = value; });
  for (const key of Object.keys(sources)) Reflect.deleteProperty(sources, key);
  for (const key of Object.keys(texts)) Reflect.deleteProperty(texts, key);
  for (const key of Object.keys(files)) Reflect.deleteProperty(files, key);
  for (const key of Object.keys(options)) Reflect.deleteProperty(options, key);
  stageValue.value = undefined;
  imageExportFormat.value = settings.tools.image.exportFormat as ImageFormat;
  for (const spec of props.tool.inputs) {
    sources[spec.id] = spec.defaultSource !== 'empty' && props.host.getSelection() ? 'selection' : spec.defaultSource !== 'empty' && props.host.getNote() ? 'note' : 'text';
    texts[spec.id] = '';
  }
  const memory = props.tool.category !== 'image' && settings.tools.rememberOptions ? settings.tools.lastOptions[props.tool.id] ?? {} : {};
  const presets = presetOptions(props.tool, props.presets ?? {});
  for (const spec of props.tool.options) options[spec.id] = presets[spec.id] ?? memory[spec.id] ?? spec.default;
  if (props.tool.inputs.some(spec => spec.kind === 'image')) {
    const handoff = takeHandoff();
    if (handoff) {
      const input = props.tool.inputs.find(spec => spec.kind === 'image')!;
      sources[input.id] = 'file';
      files[input.id] = new File([handoff.blob], handoff.name, { type: handoff.blob.type });
      if (!props.tool.heavy) void nextTick(() => run());
    }
  }
  scheduleAutoRun();
}
resetTool();
watch(() => props.tool, resetTool);

watch([sources, texts, files], () => { stageValue.value = undefined; runner.invalidate(true); scheduleAutoRun(); }, { deep: true });
watch(options, () => {
  runner.invalidate();
  if (props.tool.category !== 'image' && settings.tools.rememberOptions) settings.tools.lastOptions[props.tool.id] = rememberedOptions(props.tool, options);
  scheduleAutoRun();
}, { deep: true });

watch(() => props.noteContent, () => { stageValue.value = undefined; runner.invalidate(true); scheduleAutoRun(); });
watch(stageValue, () => { runner.invalidate(); scheduleAutoRun(); });
onBeforeUnmount(() => { cancelAutoRun(); runner.dispose(); });

function chooseFile(id: string, event: Event) {
  files[id] = (event.target as HTMLInputElement).files?.[0];
  if (props.tool.inputs.find(spec => spec.id === id)?.kind === 'image' && !props.tool.heavy && files[id]) void nextTick(() => run());
}
function acceptImageFile(file: File) {
  const id = props.tool.inputs.find(spec => spec.kind === 'image')?.id; if (!id) return;
  sources[id] = 'file'; files[id] = file; stageValue.value = undefined;
  if (!props.tool.heavy) void nextTick(() => run());
}
function acceptImageText(text: string) {
  const id = props.tool.inputs.find(spec => spec.kind === 'image')?.id; if (!id) return;
  sources[id] = 'text'; texts[id] = text; stageValue.value = undefined;
  scheduleAutoRun();
}
function onDragOver(event: DragEvent) { if (props.tool.inputs.some(spec => spec.kind === 'image')) event.preventDefault(); }
function onDrop(event: DragEvent) {
  if (!props.tool.inputs.some(spec => spec.kind === 'image')) return;
  event.preventDefault();
  const file = event.dataTransfer?.files[0]; if (file) acceptImageFile(file);
  else { const text = event.dataTransfer?.getData('text/plain'); if (text) acceptImageText(text); }
}
function onPaste(event: ClipboardEvent) {
  if (!props.tool.inputs.some(spec => spec.kind === 'image')) return;
  if ((event.target as HTMLElement)?.closest('textarea,input')) return;
  const file = event.clipboardData?.files[0]; if (file) { event.preventDefault(); acceptImageFile(file); return; }
  const text = event.clipboardData?.getData('text/plain'); if (text) { event.preventDefault(); acceptImageText(text); }
}
function sourceValues(): Record<string, SourceValue> {
  return Object.fromEntries(props.tool.inputs.map(spec => {
    const source = sources[spec.id] ?? 'text';
    const note = props.host.getNote();
    const selection = props.host.getSelection();
    const geometry = spec.kind === 'image' && stageValue.value ? (spec.stage === 'point' ? { point: stageValue.value as ImagePoint } : { region: stageValue.value as ImageRegion }) : {};
    return [spec.id, source === 'file' ? { source, file: files[spec.id], ...geometry }
      : source === 'note' ? { source, text: note?.text ?? '', language: note?.language, ...geometry }
      : source === 'selection' ? { source, text: selection?.text ?? '', language: selection?.language ?? note?.language, ...geometry }
      : { source, text: texts[spec.id] ?? '', ...geometry }];
  }));
}
async function run() {
  cancelAutoRun();
  if (props.tool.category === 'image' && !await getCodec(imageExportFormat.value).canEncode()) {
    const supported = await Promise.all(EXPORT_FORMATS.map(async format => await getCodec(format).canEncode() ? format : null));
    imageExportFormat.value = supported.find((format): format is ImageFormat => format !== null) ?? 'png';
  }
  await runner.run(sourceValues(), { ...options }, props.tool.category === 'image' ? { imageExportFormat: imageExportFormat.value } : {});
}

const noteSource = computed(() => props.tool.inputs.some(spec => sources[spec.id] === 'note'));
const selectionSource = computed(() => props.tool.inputs.some(spec => sources[spec.id] === 'selection'));
</script>

<style scoped>
.tool-label { @apply text-xs text-white/60 w-32 flex-shrink-0 leading-tight; }
</style>
