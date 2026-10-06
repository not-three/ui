<template>
  <main class="h-dvh bg-[#1e1e1e] text-white flex flex-col">
    <tools-chrome>
      <NuxtLink to="/t" class="flex-shrink-0 hover:underline underline-offset-2 focus:outline-none focus-visible:underline">Tools</NuxtLink>
      <span class="text-white/40 select-none" aria-hidden="true">/</span>
      <h1 class="font-bold truncate">{{ tool.title }}</h1>
    </tools-chrome>
    <div class="flex-grow min-h-0 w-full sm:max-w-5xl sm:mx-auto sm:border-x border-white/20">
      <tools-tool-view :tool="tool" :host="host" :presets="route.query" />
    </div>
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
