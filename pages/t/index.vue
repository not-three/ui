<template>
  <main class="min-h-screen bg-zinc-900 text-white p-4 sm:p-8">
    <nav class="mb-5"><NuxtLink to="/" class="underline">← Editor</NuxtLink></nav>
    <h1 class="text-2xl font-bold mb-3">Tools</h1>
    <label for="tool-search" class="block mb-1">Search tools</label>
    <input id="tool-search" v-model="query" type="search" class="bg-zinc-800 border border-zinc-500 rounded px-3 py-2 w-full max-w-lg" placeholder="Search by name or description">
    <section v-for="group in groups" :key="group.category" class="mt-6">
      <h2 class="text-xl capitalize mb-2">{{ group.category }}</h2>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="tool in group.tools" :key="tool.id">
          <NuxtLink :to="`/t/${tool.id}`" class="block h-full border border-zinc-600 hover:border-white rounded p-3">
            <strong>{{ tool.title }}</strong><p class="text-sm text-zinc-300">{{ tool.description }}</p>
          </NuxtLink>
        </li>
      </ul>
    </section>
    <p v-if="!groups.length" class="mt-5">No tools found.</p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { searchTools } from '~/lib/tools/search';
const query = ref('');
const groups = computed(() => {
  const filtered = searchTools(query.value);
  return [...new Set(filtered.map(tool => tool.category))].map(category => ({ category, tools: filtered.filter(tool => tool.category === category) }));
});
</script>
