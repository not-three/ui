<template>
  <section aria-label="Tool output" class="flex flex-col gap-2 min-h-36">
    <template v-if="output.kind === 'multi'">
      <section v-for="(part, index) in output.parts" :key="index" class="border border-zinc-600 rounded p-2 flex flex-col gap-2" :aria-label="part.label">
        <h3 class="font-semibold">{{ part.label }}</h3>
        <tools-output-part v-if="part.output.kind !== 'multi'" :output="part.output" :host="host" :tool-id="toolId" :note-source="noteSource" :selection-source="selectionSource" />
        <p v-else role="alert">Nested multi output is not supported.</p>
      </section>
    </template>
    <tools-output-part v-else :output="output" :host="host" :tool-id="toolId" :note-source="noteSource" :selection-source="selectionSource" />
  </section>
</template>

<script setup lang="ts">
import type { ToolHost, ToolOutput } from '~/lib/tools/types';
import ToolsOutputPart from './output-part.vue';
defineProps<{ output: ToolOutput; host: ToolHost; toolId: string; noteSource: boolean; selectionSource: boolean }>();
</script>
