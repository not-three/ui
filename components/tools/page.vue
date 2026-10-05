<template>
  <main class="min-h-screen bg-zinc-900 text-white flex flex-col">
    <nav class="p-3 bg-black"><NuxtLink to="/t" class="underline">← All tools</NuxtLink></nav>
    <tools-tool-view :tool="tool" :host="host" :presets="route.query" class="flex-grow" />
  </main>
</template>

<script setup lang="ts">
import { createPageToolHost } from '~/lib/tools/hosts';
import type { ToolDefinition } from '~/lib/tools/types';
defineProps<{ tool: ToolDefinition }>();
const route = useRoute();
const router = useRouter();
const store = useAppStore();
const host = createPageToolHost(store, path => { void router.push(path); });
</script>
