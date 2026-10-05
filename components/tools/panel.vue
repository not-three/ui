<template>
  <aside ref="root" class="w-full h-1/2 sm:h-full sm:w-[var(--tools-w)] flex-shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-600 min-w-0 min-h-0 relative" :style="{ '--tools-w': widthPct + '%' }" aria-label="Tools panel">
    <div class="absolute left-0 inset-y-0 w-1.5 cursor-col-resize touch-none hidden sm:block hover:bg-white/30 z-10" @pointerdown="startResize" @pointermove="resize" @pointerup="stopResize" @pointercancel="stopResize" @lostpointercapture="stopResize" />
    <div class="h-full flex flex-col min-h-0">
      <div class="bg-zinc-800 text-white p-2 flex gap-2 items-center">
        <label for="panel-tool" class="sr-only">Tool</label>
        <select id="panel-tool" v-model="store.activeToolId" class="bg-zinc-700 px-2 py-1 flex-grow min-w-0">
          <option v-for="listedTool in TOOLS" :key="listedTool.id" :value="listedTool.id">{{ listedTool.title }}</option>
        </select>
        <button aria-label="Close tools panel" class="px-2" @click="store.sidePanel = null">Close</button>
      </div>
      <tools-tool-view v-if="tool" :key="tool.id" :tool="tool" :host="host" :note-content="store.content" class="flex-grow" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { TOOLS, getTool } from '~/lib/tools/registry';
import { createEditorToolHost } from '~/lib/tools/hosts';
const store = useAppStore();
const settings = useSettingsStore();
const root = ref<HTMLElement>();
const widthPct = ref(Math.max(20, Math.min(80, settings.tools.panelWidthPct)));
const tool = computed(() => getTool(store.activeToolId) ?? TOOLS[0]);
const host = createEditorToolHost(store);
let resizing = false;
function startResize(event: PointerEvent) { (event.target as HTMLElement).setPointerCapture(event.pointerId); resizing = true; }
function resize(event: PointerEvent) {
  if (!resizing) return;
  const rect = root.value?.parentElement?.getBoundingClientRect();
  if (!rect?.width) return;
  widthPct.value = Math.max(20, Math.min(80, ((rect.right - event.clientX) / rect.width) * 100));
}
function stopResize() { if (resizing) settings.tools.panelWidthPct = widthPct.value; resizing = false; }
</script>
