<template>
  <div class="flex flex-col gap-2">
    <tools-monaco-output v-if="output.kind === 'text' || output.kind === 'diff'" :output="output" />
    <p v-if="output.kind === 'bytes'">{{ output.bytes.byteLength }} bytes</p>
    <ul v-if="output.kind === 'report'" class="list-disc pl-5">
      <li v-for="(item, index) in output.items" :key="index">
        <button v-if="item.position && noteSource" name="reveal" class="underline text-left" @click="host.revealPosition(item.position)">{{ item.level }}: {{ item.message }} ({{ item.position.line }}:{{ item.position.column }})</button>
        <span v-else>{{ item.level }}: {{ item.message }}</span>
      </li>
    </ul>
    <tools-monaco-output v-if="output.kind === 'report' && output.text" :output="{ kind: 'text', text: output.text, language: output.language }" />
    <table v-if="output.kind === 'table'" class="border-collapse text-sm"><thead><tr><th v-for="column in output.columns" :key="column" class="border p-1 text-left">{{ column }}</th></tr></thead><tbody><tr v-for="(row, index) in output.rows" :key="index"><td v-for="(cell, col) in row" :key="col" class="border p-1 break-all">{{ cell }}</td></tr></tbody></table>
    <div class="flex flex-wrap gap-2">
      <button v-if="output.kind !== 'bytes'" class="tool-button" @click="copy">Copy</button>
      <button v-if="hasEditorSource && output.kind === 'text'" name="replace-note" class="tool-button" @click="host.replaceNote(output.text)">Replace note</button>
      <button v-if="hasEditorSource && output.kind === 'text' && selectionSource" name="replace-selection" class="tool-button" @click="host.replaceSelection(output.text)">Replace selection</button>
      <button v-if="hasEditorSource && output.kind === 'text'" class="tool-button" @click="host.insertAtCursor(output.text)">Insert at cursor</button>
      <button v-if="hasEditorSource && output.kind === 'diff'" name="take-left" class="tool-button" @click="takeSide(output.left)">Take left</button>
      <button v-if="hasEditorSource && output.kind === 'diff'" name="take-right" class="tool-button" @click="takeSide(output.right)">Take right</button>
      <button class="tool-button" @click="download">Download</button>
      <button v-if="!host.getNote() && host.createNote && output.kind !== 'bytes'" class="tool-button" @click="host.createNote(outputText(), outputLanguage())">Open in editor</button>
    </div>
    <p v-if="actionError" class="text-red-300" role="alert">{{ actionError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ToolHost, ToolOutput } from '~/lib/tools/types';
import ToolsMonacoOutput from './monaco-output.vue';
type SingleOutput = Exclude<ToolOutput, { kind: 'multi' }>;
const props = defineProps<{ output: SingleOutput; host: ToolHost; toolId: string; noteSource: boolean; selectionSource: boolean }>();
const actionError = ref('');
const hasEditorSource = computed(() => !!props.host.getNote() && (props.noteSource || props.selectionSource));

function outputText(): string {
  const output = props.output;
  if (output.kind === 'text') return output.text;
  if (output.kind === 'diff') return output.right;
  if (output.kind === 'report') return output.text ?? output.items.map(item => `${item.level}: ${item.message}`).join('\n');
  if (output.kind === 'table') return [output.columns.join('\t'), ...output.rows.map(row => row.join('\t'))].join('\n');
  return '';
}
function outputLanguage(): string | undefined {
  return props.output.kind === 'table' || props.output.kind === 'bytes' ? undefined : props.output.language;
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

<style scoped>
.tool-button { @apply bg-zinc-700 hover:bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-white; }
</style>
