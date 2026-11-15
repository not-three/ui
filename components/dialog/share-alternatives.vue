<template>
  <div class="mt-3 space-y-4">
    <div v-for="row in data.alternatives" :key="row.id" data-share-alternative class="border-t border-white/20 pt-3">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-bold">{{ row.label }}</h2>
          <p class="text-sm text-white/70">{{ row.description }}</p>
        </div>
        <button type="button" class="shrink-0" :aria-label="`Copy ${row.label}`" @click="copy(row.value)">Copy</button>
      </div>
      <code class="block mt-2 p-2 border border-white/20 font-mono text-sm whitespace-pre-wrap break-all select-all">{{ row.value }}</code>
    </div>
    <div class="text-right">
      <button type="button" @click="emit('close')">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShareAlternativesDialog } from '~/lib/dialog';

defineProps<{ data: ShareAlternativesDialog }>();
const emit = defineEmits<{ close: [] }>();

function copy(value: string) {
  void navigator.clipboard.writeText(value);
}
</script>
