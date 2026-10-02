<template>
  <div
    ref="root"
    class="w-full h-1/2 sm:h-full sm:w-[var(--sandbox-w)] flex-shrink-0 border-t border-black sm:border-t-0 sm:border-l min-w-0 min-h-0 relative"
    :style="{ '--sandbox-w': widthPct + '%' }"
  >
    <div
      class="absolute left-0 inset-y-0 w-1.5 cursor-col-resize touch-none hidden sm:block hover:bg-white/30 z-10"
      :class="{ 'bg-white/30': resizing }"
      @pointerdown="startResize"
      @pointermove="onResizeMove"
      @pointerup="stopResize"
      @pointercancel="stopResize"
      @lostpointercapture="stopResize"
    />
    <editor-sandbox-panel
      :content="store.content"
      :language-id="store.getCurrentLanguage().id"
      :resizing="resizing"
      @close="store.sandbox = false"
      @popout="openPopout"
    />
  </div>
</template>

<script lang="ts" setup>
import { OkDialog } from "~/lib/dialog";
import { setPopoutWindow } from "~/lib/sandbox/popout-bridge";

/**
 * In-editor host for the sandbox panel: store bindings, the drag-resizable
 * width (meaningless in the popout, so it lives here rather than in the
 * panel core) and launching the popout window.
 */
const MIN_WIDTH_PCT = 20;
const MAX_WIDTH_PCT = 80;

const store = useAppStore();
const { uiBaseURL } = useRuntimeConfig().public;
const root = ref<HTMLDivElement>();
const widthPct = ref(50);
const resizing = ref(false);

// Pointer events unify mouse/touch/pen; touch-action: none on the handle
// stops the browser from turning the drag into a scroll on touch screens.
function startResize(event: PointerEvent) {
  (event.target as HTMLElement).setPointerCapture(event.pointerId);
  resizing.value = true;
}

function onResizeMove(event: PointerEvent) {
  if (!resizing.value) return;
  const parent = root.value?.parentElement;
  if (!parent) return;
  const rect = parent.getBoundingClientRect();
  if (!(rect.width > 0)) return;
  const pct = ((rect.right - event.clientX) / rect.width) * 100;
  widthPct.value = Math.min(MAX_WIDTH_PCT, Math.max(MIN_WIDTH_PCT, pct));
}

function stopResize() {
  resizing.value = false;
}

function openPopout() {
  // Same base-path handling as the vendor URLs: a subpath deployment serves
  // the popout route behind that prefix too.
  const base = String(uiBaseURL || "/").replace(/^\/*/, "/").replace(/\/*$/, "/");
  const win = window.open(base + "popout", "not3-sandbox-popout", "width=960,height=720");
  if (!win) {
    store.dialog = new OkDialog(
      "Popup blocked",
      "Your browser blocked the popout window. Allow popups for this site and try again.",
    );
    return;
  }
  setPopoutWindow(win);
  store.sandboxPopout = true; // unmounts this wrapper, mounts the bridge
}
</script>
