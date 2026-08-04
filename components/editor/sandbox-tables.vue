<template>
  <div class="flex-grow basis-0 overflow-auto flex flex-col text-xs font-mono min-h-0">
    <div v-if="!tables.length" class="flex-grow flex items-center justify-center text-white/50 px-4 text-center">
      No tables found. CREATE TABLE + INSERT something, then Run.
    </div>
    <template v-else>
      <div class="flex items-center gap-2 px-2 py-1 border-b border-black flex-wrap">
        <select
          :value="selected"
          class="bg-black border border-white/40 rounded-sm py-0.5"
          @change="$emit('select', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="t in tables" :key="t.name" :value="t.name">
            {{ t.name }} ({{ t.rowCount }})
          </option>
        </select>
        <input
          :value="search"
          placeholder="Search…"
          class="bg-transparent border border-white/40 rounded-sm px-1 py-0.5 outline-none"
          @input="$emit('search', ($event.target as HTMLInputElement).value)"
        >
        <button class="border border-white/40 px-2 rounded-sm hover:bg-white/10" @click="$emit('refresh')">
          Refresh
        </button>
      </div>
      <div class="overflow-auto flex-grow min-h-0">
        <table class="border-collapse w-full">
          <thead class="sticky top-0 bg-[#111]">
            <tr>
              <th
                v-for="col in columns"
                :key="col"
                class="text-left px-2 py-1 border-b border-white/20 cursor-pointer select-none whitespace-nowrap"
                @click="$emit('sort', col)"
              >
                {{ col }}
                <span v-if="sortBy === col">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rows" :key="i" class="odd:bg-white/5">
              <td
                v-for="(cell, j) in row"
                :key="j"
                class="px-2 py-0.5 whitespace-nowrap max-w-64 overflow-hidden text-ellipsis"
              >{{ cell }}</td>
            </tr>
            <tr v-if="!rows.length">
              <td :colspan="columns.length" class="px-2 py-2 text-white/50">No rows.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center gap-2 px-2 py-1 border-t border-black">
        <button
          class="border border-white/40 px-2 rounded-sm disabled:opacity-40"
          :disabled="offset === 0"
          @click="$emit('page', -1)"
        >‹</button>
        <span>{{ total ? offset + 1 : 0 }}–{{ Math.min(offset + rows.length, total) }} of {{ total }}</span>
        <button
          class="border border-white/40 px-2 rounded-sm disabled:opacity-40"
          :disabled="offset + limit >= total"
          @click="$emit('page', 1)"
        >›</button>
        <span v-if="loading" class="text-white/50">loading…</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { SandboxTableInfo } from "~/lib/sandbox/protocol";

/**
 * Read-only browser for the SQL runner's live database. Pure presentation:
 * every query goes through the panel, which talks to the iframe. All table
 * names, column names and cell values come out of the sandbox and are
 * therefore rendered exclusively through `{{ }}` text interpolation — never
 * innerHTML, never a string-built attribute or style.
 */
defineProps<{
  tables: SandboxTableInfo[];
  selected: string;
  columns: string[];
  rows: string[][];
  total: number;
  offset: number;
  limit: number;
  sortBy: string | null;
  sortDir: "asc" | "desc";
  search: string;
  loading: boolean;
}>();

defineEmits<{
  select: [string];
  search: [string];
  sort: [string];
  page: [number];
  refresh: [];
}>();
</script>
