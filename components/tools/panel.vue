<template>
  <aside ref="root" class="w-full h-1/2 sm:h-full sm:w-[var(--tools-w)] flex-shrink-0 border-t border-white/20 sm:border-t-0 sm:border-l min-w-0 min-h-0 relative" :style="{ '--tools-w': widthPct + '%' }" aria-label="Tools panel">
    <div class="absolute left-0 inset-y-0 w-1.5 cursor-col-resize touch-none hidden sm:block hover:bg-white/30 z-10" :class="{ 'bg-white/30': resizing }" @pointerdown="startResize" @pointermove="resize" @pointerup="stopResize" @pointercancel="stopResize" @lostpointercapture="stopResize" />
    <tools-tool-view :tool="tool" :host="host" :note-content="store.content">
      <template #header>
        <span class="font-bold select-none">Tools</span>
        <label for="panel-tool" class="sr-only">Tool</label>
        <select id="panel-tool" v-model="store.activeToolId" class="panel-select min-w-0 max-w-full">
          <option v-for="listedTool in TOOLS" :key="listedTool.id" :value="listedTool.id">{{ listedTool.title }}</option>
        </select>
      </template>
      <template #actions>
        <button aria-label="Close tools panel" class="panel-btn" @click="store.sidePanel = null">Close</button>
      </template>
    </tools-tool-view>
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
const resizing = ref(false);
function startResize(event: PointerEvent) { (event.target as HTMLElement).setPointerCapture(event.pointerId); resizing.value = true; }
function resize(event: PointerEvent) {
  if (!resizing.value) return;
  const rect = root.value?.parentElement?.getBoundingClientRect();
  if (!rect?.width) return;
  widthPct.value = Math.max(20, Math.min(80, ((rect.right - event.clientX) / rect.width) * 100));
}
function stopResize() { if (resizing.value) settings.tools.panelWidthPct = widthPct.value; resizing.value = false; }
</script>
