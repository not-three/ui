<template><div ref="container" class="min-h-48 h-64 w-full border border-white/20" :aria-label="output.kind === 'diff' ? 'Diff output' : 'Text output'" /></template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import type * as Monaco from 'monaco-editor';
import type { ToolOutput } from '~/lib/tools/types';

const props = defineProps<{ output: Extract<ToolOutput, { kind: 'text' | 'diff' }> }>();
const container = ref<HTMLDivElement>();
let editor: Monaco.editor.IStandaloneCodeEditor | Monaco.editor.IStandaloneDiffEditor | null = null;
let models: Monaco.editor.ITextModel[] = [];
let active = true;

async function render() {
  if (!container.value) return;
  const monaco = await import('monaco-editor');
  if (!active || !container.value) return;
  editor?.dispose();
  models.forEach(model => model.dispose());
  models = [];
  const language = props.output.language || 'plaintext';
  if (props.output.kind === 'diff') {
    const original = monaco.editor.createModel(props.output.displayLeft ?? props.output.left, language);
    const modified = monaco.editor.createModel(props.output.displayRight ?? props.output.right, language);
    models = [original, modified];
    const diffEditor = monaco.editor.createDiffEditor(container.value, { theme: 'vs-dark', readOnly: true, originalEditable: false, automaticLayout: true });
    diffEditor.setModel({ original, modified });
    editor = diffEditor;
  } else {
    const model = monaco.editor.createModel(props.output.text, language);
    models = [model];
    editor = monaco.editor.create(container.value, { model, theme: 'vs-dark', readOnly: true, automaticLayout: true, minimap: { enabled: false } });
  }
}
onMounted(async () => { const { setupMonaco } = await import('~/lib/monaco/setup'); await setupMonaco(); await render(); });
watch(() => props.output, () => { void render(); });
onBeforeUnmount(() => { active = false; editor?.dispose(); models.forEach(model => model.dispose()); });
</script>
