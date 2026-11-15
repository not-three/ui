<template>
  <main class="min-h-screen bg-[rgb(var(--not3-surface))] text-white flex flex-col">
    <tools-chrome><h1 class="font-bold select-none">Tools</h1></tools-chrome>
    <div class="px-4 py-3">
      <input ref="search" v-model="query" type="search" aria-label="Search tools" class="w-full max-w-lg bg-black border border-white px-2 py-1 focus:outline-none" placeholder="Search by name or description">
    </div>
    <section v-for="(group, index) in groups" :key="group.category" class="overflow-hidden">
      <h2 class="px-4 py-1 text-xs font-bold uppercase tracking-wide border-b border-white/20 bg-black/40 select-none" :class="{ 'border-t': index === 0 }">{{ group.category }}</h2>
      <ul class="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 -mr-px">
        <li v-for="tool in group.tools" :key="tool.id" class="border-r border-b border-white/20">
          <NuxtLink :to="`/t/${tool.id}`" class="block h-full px-4 py-2 hover:bg-white/10 focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-white focus-visible:-outline-offset-1">
            <strong>{{ tool.title }}</strong><p class="text-sm text-white/60">{{ tool.description }}</p>
          </NuxtLink>
        </li>
      </ul>
    </section>
    <p v-if="!groups.length" class="px-4 py-3 text-white/60">No tools found.</p>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { searchTools } from '~/lib/tools/search';
const query = ref('');
const search = ref<HTMLInputElement>();
const groups = computed(() => {
  const filtered = searchTools(query.value);
  return [...new Set(filtered.map(tool => tool.category))].map(category => ({ category, tools: filtered.filter(tool => tool.category === category) }));
});
// Phones would pop the on-screen keyboard over the list, so only focus on wider screens.
onMounted(() => { if (window.matchMedia('(min-width: 640px)').matches) search.value?.focus(); });
</script>
