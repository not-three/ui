<template>
  <div class="flex flex-col gap-2 text-xs">
    <div v-if="inputImage" class="flex gap-1 items-center"><span>Preview</span><tools-segmented v-model="preview" label="Preview" :items="[{ value: 'after', label: 'After' }, { value: 'before', label: 'Before' }]" /></div>
    <tools-image-stage :blob="preview === 'before' ? beforeBlob : output.blob" mode="view" :width="preview === 'before' && inputImage ? inputImage.width : output.width" :height="preview === 'before' && inputImage ? inputImage.height : output.height" :checkerboard="settings.tools.image.checkerboard" />
    <div class="flex items-center gap-2 text-white/60"><span>{{ output.width }} × {{ output.height }} px</span><span data-export-size>{{ readyBlob ? `${formatSize(readyBlob.size)}` : 'Encoding…' }}</span></div>
    <template v-if="output.exportable !== false">
      <div class="flex items-center gap-2 flex-wrap">
        <span>Export</span>
        <tools-segmented :model-value="format" label="Export format" :items="available.map(value => ({ value, label: value.toUpperCase() }))" @update:model-value="setFormat" />
      </div>
      <div v-if="format !== 'png'" class="flex gap-2 items-center flex-wrap">
        <label for="image-export-quality">Quality</label><input id="image-export-quality" :value="quality" type="number" min="1" max="100" class="panel-input w-20" @input="setQuality">
        <label v-if="getCodec(format).supportsLossless" class="flex gap-1 items-center"><input v-model="lossless" type="checkbox">Lossless</label>
      </div>
    </template>
    <div class="flex gap-1 flex-wrap">
      <button class="panel-btn" :disabled="!readyBlob" @click="download">Download</button>
      <button v-if="copySupported" class="panel-btn" @click="copyImage">Copy image</button>
      <button class="panel-btn" :disabled="!readyBlob" @click="insertDataUrl">Insert as data URL</button>
      <div class="relative">
        <button class="panel-btn" @click="showContinue = !showContinue">Continue with…</button>
        <div v-if="showContinue" class="absolute z-10 bg-black border border-white p-1 flex flex-col gap-1 max-h-48 overflow-auto min-w-40">
          <button v-for="tool in otherImageTools" :key="tool.id" class="panel-btn text-left" @click="continueWith(tool.id)">{{ tool.title }}</button>
        </div>
      </div>
    </div>
    <p v-if="error" role="alert" class="text-red-400">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { EXPORT_FORMATS, getCodec, type ImageFormat } from '~/lib/image/codecs';
import { createImageExport } from '~/lib/image/export';
import { putHandoff } from '~/lib/tools/handoff';
import { TOOLS } from '~/lib/tools/registry';
import type { ToolHost, ToolInput, ToolSingleOutput } from '~/lib/tools/types';
import ToolsImageStage from './image-stage.vue';
import ToolsSegmented from './segmented.vue';
const props = defineProps<{ output: Extract<ToolSingleOutput, {kind: 'image'}>; host: ToolHost; toolId: string; inputImage?: Extract<ToolInput, {kind: 'image'}> | null; imageExportFormat?: ImageFormat }>();
const emit = defineEmits<{ 'update:imageExportFormat': [format: ImageFormat] }>();
const settings = useSettingsStore();
const router = useRouter();
const format = ref<ImageFormat>('png');
const quality = ref(82);
const lossless = ref(false);
const available = ref<ImageFormat[]>([]);
const readyBlob = ref<Blob | null>(null);
const beforeBlob = computed(() => props.inputImage ? new Blob([props.inputImage.bytes as BlobPart], { type: props.inputImage.mimeType }) : undefined);
const preview = ref('after');
const showContinue = ref(false);
const error = ref('');
const copySupported = typeof navigator !== 'undefined' && !!navigator.clipboard?.write && typeof ClipboardItem !== 'undefined';
const otherImageTools = computed(() => TOOLS.filter(tool => tool.category === 'image' && tool.id !== props.toolId && tool.inputs.some(input => input.kind === 'image')));
const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
let job = createImageExport(props.output.blob, props.output.width, props.output.height);
let timer: ReturnType<typeof setTimeout> | null = null;
let serial = 0;
function clearTimer() { if (timer) clearTimeout(timer); timer = null; }
async function probe() {
  const possible = await Promise.all(EXPORT_FORMATS.map(async item => await getCodec(item).canEncode() ? item : null));
  available.value = possible.filter((item): item is ImageFormat => !!item);
  const preferred = props.imageExportFormat ?? settings.tools.image.exportFormat as ImageFormat;
  format.value = available.value.includes(preferred) ? preferred : available.value.includes('png') ? 'png' : available.value[0] ?? 'png';
  if (format.value !== preferred) emit('update:imageExportFormat', format.value);
  quality.value = settings.tools.image.exportQuality;
  schedule();
}
watch(() => props.output, () => { job.dispose(); job = createImageExport(props.output.blob, props.output.width, props.output.height); preview.value = 'after'; schedule(); });
void probe();
function schedule() {
  clearTimer(); job.dispose(); readyBlob.value = null; error.value = '';
  const own = ++serial;
  if (props.output.exportable === false) { readyBlob.value = props.output.blob; return; }
  timer = setTimeout(async () => {
    timer = null;
    try { const blob = await job.encode(format.value, { quality: quality.value, lossless: lossless.value }); if (own === serial) readyBlob.value = blob; }
    catch (reason) { if (own === serial && !(reason instanceof DOMException && reason.name === 'AbortError')) error.value = reason instanceof Error ? reason.message : String(reason); }
  }, 300);
}
watch(lossless, schedule);
onBeforeUnmount(() => { serial++; clearTimer(); job.dispose(); });
function setFormat(value: string) { format.value = value as ImageFormat; emit('update:imageExportFormat', format.value); settings.tools.image.exportFormat = value; schedule(); }
function setQuality(event: Event) { quality.value = Math.max(1, Math.min(100, Number((event.target as HTMLInputElement).value) || 82)); settings.tools.image.exportQuality = quality.value; schedule(); }
function extension() { return format.value === 'jpeg' ? 'jpg' : format.value; }
function download() {
  if (!readyBlob.value) return;
  const url = URL.createObjectURL(readyBlob.value);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = props.output.filename.replace(/\.[^.]+$/, '') + '.' + extension(); anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
async function copyImage() {
  try {
    const png = await createImageExport(props.output.blob, props.output.width, props.output.height).encode('png', {});
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
  } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason); }
}
async function insertDataUrl() {
  const blob = readyBlob.value; if (!blob) return;
  if (blob.size > 2 * 1024 * 1024) { error.value = 'Image exceeds 2 MiB; download instead'; return; }
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  const dataUrl = `data:${blob.type};base64,${btoa(binary)}`;
  if (props.host.getNote()) props.host.insertAtCursor(dataUrl);
  else if (props.host.createNote) props.host.createNote(dataUrl, 'plaintext');
  else error.value = 'Open an editor to insert the data URL';
}
function continueWith(id: string) {
  putHandoff({ blob: props.output.blob, name: props.output.filename, width: props.output.width, height: props.output.height });
  showContinue.value = false;
  void router.push(`/t/${id}`);
}
</script>
