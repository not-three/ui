<template>
  <div class="flex flex-col gap-2">
    <tools-image-output v-if="output.kind === 'image'" :output="output" :host="host" :tool-id="toolId" :input-image="inputImage" />
    <template v-else>
    <tools-monaco-output v-if="output.kind === 'text' || output.kind === 'diff'" :output="output" />
    <img v-if="imageUrl" :src="imageUrl" alt="Image preview" class="max-w-full max-h-96 self-start bg-white border border-white/20" :style="{ imageRendering: 'pixelated' }">
    <p v-if="output.kind === 'bytes'" class="text-xs text-white/60">{{ output.bytes.byteLength }} bytes</p>
    <tools-monaco-output v-if="output.kind === 'bytes' && output.text !== undefined" :output="{ kind: 'text', text: output.text, language: 'plaintext' }" />
    <ul v-if="output.kind === 'report'" class="font-mono text-xs">
      <li v-for="(item, index) in output.items" :key="index" data-report-item class="flex gap-2 py-px">
        <span class="flex-shrink-0 w-16" :class="LEVEL_CLASSES[item.level]">{{ item.level }}:</span> <button v-if="item.position && noteSource" name="reveal" class="flex gap-2 text-left hover:underline focus:outline-none focus-visible:underline" @click="host.revealPosition(item.position)"><span class="flex-shrink-0 text-white/60">{{ item.position.line }}:{{ item.position.column }}</span> <span class="whitespace-pre-wrap break-all">{{ item.message }}</span></button>
        <template v-else><span v-if="item.position" class="flex-shrink-0 text-white/60">{{ item.position.line }}:{{ item.position.column }}</span> <span class="whitespace-pre-wrap break-all">{{ item.message }}</span></template>
      </li>
    </ul>
    <tools-monaco-output v-if="output.kind === 'report' && output.text" :output="{ kind: 'text', text: output.text, language: output.language }" />
    <div v-if="output.kind === 'table'" class="overflow-x-auto">
      <table class="border-collapse text-xs w-full">
        <thead class="bg-white/5"><tr><th v-for="column in output.columns" :key="column" class="border border-white/20 px-1 py-0.5 text-left font-bold">{{ column }}</th></tr></thead>
        <tbody><tr v-for="(row, index) in output.rows" :key="index"><td v-for="(cell, col) in row" :key="col" class="border border-white/20 px-1 py-0.5 font-mono break-all">{{ cell }}</td></tr></tbody>
      </table>
    </div>
    <div class="flex flex-wrap gap-1 text-xs">
      <button v-if="output.kind !== 'bytes' || output.text !== undefined" class="panel-btn" @click="copy">Copy</button>
      <button v-if="hasEditorSource && editableText !== undefined" name="replace-note" class="panel-btn" @click="host.replaceNote(editableText)">Replace note</button>
      <button v-if="hasEditorSource && editableText !== undefined && selectionSource" name="replace-selection" class="panel-btn" @click="host.replaceSelection(editableText)">Replace selection</button>
      <button v-if="hasEditorSource && editableText !== undefined" class="panel-btn" @click="host.insertAtCursor(editableText)">Insert at cursor</button>
      <button v-if="hasEditorSource && output.kind === 'diff'" name="take-left" class="panel-btn" @click="takeSide(output.left)">Take left</button>
      <button v-if="hasEditorSource && output.kind === 'diff'" name="take-right" class="panel-btn" @click="takeSide(output.right)">Take right</button>
      <button class="panel-btn" @click="download">Download</button>
      <button v-if="!host.getNote() && host.createNote && (output.kind !== 'bytes' || output.text !== undefined)" class="panel-btn" @click="host.createNote(outputText(), outputLanguage())">Open in editor</button>
    </div>
    <p v-if="actionError" class="text-red-400 text-xs" role="alert">{{ actionError }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { ToolHost, ToolInput, ToolSingleOutput } from '~/lib/tools/types';
import ToolsImageOutput from './image-output.vue';
import ToolsMonacoOutput from './monaco-output.vue';
const props = defineProps<{ output: ToolSingleOutput; host: ToolHost; toolId: string; noteSource: boolean; selectionSource: boolean; inputImage?: Extract<ToolInput, {kind: 'image'}> | null }>();
const actionError = ref('');
const LEVEL_CLASSES: Record<string, string> = { error: 'text-red-400', warning: 'text-yellow-400', info: 'text-white/60', success: 'text-green-400' };
const hasEditorSource = computed(() => !!props.host.getNote() && (props.noteSource || props.selectionSource));
const editableText = computed(() => props.output.kind === 'text' || props.output.kind === 'bytes' ? props.output.text : undefined);

// Image bytes (for example a generated QR code) are previewed inline through an
// object URL that is released as soon as the output changes or the part unmounts.
const imageUrl = ref('');
function releaseImage() { if (imageUrl.value) URL.revokeObjectURL(imageUrl.value); imageUrl.value = ''; }
watch(() => props.output, output => {
  releaseImage();
  if (output.kind === 'bytes' && output.mimeType?.startsWith('image/') && typeof URL.createObjectURL === 'function') {
    imageUrl.value = URL.createObjectURL(new Blob([output.bytes as BlobPart], { type: output.mimeType }));
  }
}, { immediate: true });
onBeforeUnmount(releaseImage);

function outputText(): string {
  const output = props.output;
  if (output.kind === 'text') return output.text;
  if (output.kind === 'bytes') return output.text ?? '';
  if (output.kind === 'diff') return output.right;
  if (output.kind === 'report') return output.text ?? output.items.map(item => `${item.level}: ${item.message}`).join('\n');
  if (output.kind === 'table') return [output.columns.join('\t'), ...output.rows.map(row => row.join('\t'))].join('\n');
  return '';
}
function outputLanguage(): string | undefined {
  return props.output.kind === 'table' || props.output.kind === 'bytes' || props.output.kind === 'image' ? undefined : props.output.language;
}
async function copy() { try { await navigator.clipboard.writeText(outputText()); } catch (error) { actionError.value = error instanceof Error ? error.message : String(error); } }
function takeSide(text: string) { if (props.selectionSource) props.host.replaceSelection(text); else props.host.replaceNote(text); }
function download() {
  const output = props.output;
  const extension = output.kind === 'text' && output.language && output.language !== 'plaintext' ? output.language : 'txt';
  const filename = output.kind === 'bytes' ? output.filename ?? `${props.toolId}.bin` : output.kind === 'text' ? output.filename ?? `${props.toolId}.${extension}` : `${props.toolId}.txt`;
  const blob = output.kind === 'bytes' ? new Blob([output.bytes as BlobPart], { type: output.mimeType ?? 'application/octet-stream' }) : new Blob([outputText()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
</script>
