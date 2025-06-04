<template>
  <div class="absolute inset-0 z-10">
    <div class="absolute inset-0 bg-white transition-opacity" :class="{ 'opacity-0 pointer-events-none': !store.loading }">
      <div class="w-full h-full bg-black/90"/>
    </div>
    <iframe
      ref="iframe"
      :src="store.config.drawURL"
      class="w-full h-full border-none"
    />
  </div>
</template>

<script lang="ts" setup>
import { OkDialog } from '~/lib/dialog';

const iframe = ref<HTMLIFrameElement>();
const store = useAppStore();
const timeout = ref<number | null>(null);

function onChildMessage(event: MessageEvent) {
  if (typeof event.data !== "object") return;
  switch (event.data.type) {
    case "not3/draw/load": {
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
  if (timeout.value) window.clearTimeout(timeout.value);
  store.loading = false;
});
</script>
