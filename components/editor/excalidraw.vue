<template>
  <div class="absolute inset-0 z-10">
    <div class="absolute inset-0 bg-white transition-opacity" :class="{ 'opacity-0 pointer-events-none': !store.loading }">
      <div class="w-full h-full bg-black/90"/>
    </div>
    <iframe
      ref="iframe"
      :src="store.config.drawURL"
      class="w-full h-full border-none"
      @load="keybindings.reset()"
    />
  </div>
</template>

<script lang="ts" setup>
import { OkDialog } from '~/lib/dialog';
import { activeCowork } from '~/lib/cowork/active';
import { CoworkDraw, reconcileDraw, type DrawElement } from '~/lib/cowork/draw';
import * as Actions from "~/lib/actions";
import { createDrawKeybindingAdapter } from "~/lib/keybindings/draw-adapter";
import { getKeybindingResolver } from "~/lib/keybindings/runtime";
import { dispatchNot3Action } from "~/lib/monaco/editor-actions";

const iframe = ref<HTMLIFrameElement>();
const store = useAppStore();
const timeout = ref<number | null>(null);
const iframeReady = ref(false);
let currentDraw: CoworkDraw | null = null;
const drawOrigin = computed(() => new URL(store.config.drawURL || window.location.href, window.location.href).origin);
function contentElements(): DrawElement[] {
  try {
    const content = JSON.parse(store.content);
    return content?.type === "EXCALIDRAW" && Array.isArray(content.data) ? content.data : [];
  } catch { return []; }
}
const keybindings = createDrawKeybindingAdapter(
  () => iframe.value?.contentWindow,
  getKeybindingResolver,
  dispatchNot3Action,
);

function attachDraw() {
  const active = activeCowork.value;
  if (!iframeReady.value || active?.session.kind !== "draw" || active.draw || !iframe.value?.contentWindow) return;
  const draw = new CoworkDraw(active.session, iframe.value.contentWindow, drawOrigin.value, {
    initial: contentElements(), onContent: value => { store.content = value },
  });
  active.draw = draw;
  currentDraw = draw;
  draw.start();
}

watch(() => [activeCowork.value?.session, activeCowork.value?.session.kind], () => {
  if (currentDraw && activeCowork.value?.draw !== currentDraw) { currentDraw.destroy(); currentDraw = null; }
  attachDraw();
});

function onChildMessage(event: MessageEvent) {
  if (!iframe.value?.contentWindow || event.source !== iframe.value.contentWindow || event.origin !== drawOrigin.value) return;
  if (!event.data || typeof event.data !== "object") return;
  if (activeCowork.value?.draw?.handleMessage(event)) return;
  switch (event.data.type) {
    case "not3/draw/load": {
      currentDraw?.destroy();
      if (activeCowork.value?.draw === currentDraw) activeCowork.value.draw = null;
      currentDraw = null;
      if (timeout.value) window.clearTimeout(timeout.value);
      let content: {type: string, data: Array<unknown>} = {type: "EXCALIDRAW", data: []};
      if (store.content) try {
        content = JSON.parse(store.content);
      } catch {/* ignored */}
      if (typeof content !== "object" || content.type !== "EXCALIDRAW" || !Array.isArray(content.data)) {
        content = {
          type: "EXCALIDRAW",
          data: [],
        };
      }
      iframe.value?.contentWindow?.postMessage({
        type: "not3/draw/init",
        payload: {
          href: window.location.href,
          content: content.data,
          readonly: store.readonly,
        },
      }, "*");
      iframe.value?.contentWindow?.postMessage({ type: "not3/draw/keys/1/enable" }, "*");
      iframeReady.value = true;
      attachDraw();
      window.setTimeout(() => {
        store.loading = false;
      }, 250);
      break;
    }
    case "not3/draw/change":
      if (store.readonly) return;
      store.content = JSON.stringify({
        type: "EXCALIDRAW",
        data: event.data.payload,
      });
      break;
    case "not3/draw/save": {
      if (event.data?.payload && !store.readonly) {
        const data = activeCowork.value?.draw && Array.isArray(event.data.payload)
          ? reconcileDraw(activeCowork.value.draw.elements, event.data.payload as DrawElement[])
          : event.data.payload;
        store.content = JSON.stringify({ type: "EXCALIDRAW", data });
      }
      if (activeCowork.value?.session.kind === "draw") void activeCowork.value.session.saveAsNote();
      else Actions.SAVE();
      break;
    }
    case "not3/draw/keys/1/keydown":
      keybindings.handleMessage(event);
      break;
  }
}

onBeforeMount(() => {
  store.loading = true;
})

onMounted(() => {
  window.addEventListener("message", onChildMessage);
  timeout.value = window.setTimeout(() => {
    timeout.value = null;
    if (store.loading) {
      store.loading = false;
      store.dialog = new OkDialog(
        "Excalidraw Error",
        "Failed to load Excalidraw. Please check your network connection or try again later.",
        () => store.excalidraw = false,
      );
    }
  }, 30_000);
})

onBeforeUnmount(() => {
  window.removeEventListener("message", onChildMessage);
  currentDraw?.destroy();
  if (activeCowork.value?.draw === currentDraw) activeCowork.value.draw = null;
  currentDraw = null;
  if (timeout.value) window.clearTimeout(timeout.value);
  store.loading = false;
});
</script>
