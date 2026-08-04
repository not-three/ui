<template>
  <!-- Effectively renderless: `hidden` keeps it out of the editor's flex
       layout. Vue SFCs cannot have an empty template root. -->
  <div class="hidden" />
</template>

<script lang="ts" setup>
import { debounce } from "~/lib/monaco/utils";
import {
  POPOUT_READY_MESSAGE,
  POPOUT_STATE_MESSAGE,
  closePopoutWindow,
  getPopoutWindow,
  parsePopoutMessage,
} from "~/lib/sandbox/popout-bridge";

/**
 * Mounted only while the popout window owns the panel. Streams note state to
 * the popup, and ties the popup's lifetime to this tab: if the popup is
 * closed the panel returns to the editor, and if this tab goes away (Stop,
 * navigation, teardown) the popup is closed.
 */
const store = useAppStore();
let pollTimer: ReturnType<typeof setInterval> | null = null;

function sendState() {
  const win = getPopoutWindow();
  if (!win || win.closed) return;
  win.postMessage(
    {
      type: POPOUT_STATE_MESSAGE,
      content: store.content,
      languageId: store.getCurrentLanguage().id,
    },
    window.location.origin,
  );
}

const sendStateDebounced = debounce(sendState, 300);

function onMessage(event: MessageEvent) {
  const win = getPopoutWindow();
  if (!win || event.source !== win) return;
  if (event.origin !== window.location.origin) return;
  const msg = parsePopoutMessage(event.data);
  if (msg?.type === POPOUT_READY_MESSAGE) sendState();
}

function onPageHide() {
  closePopoutWindow();
}

watch(() => store.content, () => sendStateDebounced());
watch(() => store.getCurrentLanguage().id, () => sendState());

onMounted(() => {
  window.addEventListener("message", onMessage);
  window.addEventListener("pagehide", onPageHide);
  sendState(); // popup may already be ready before we mounted
  pollTimer = setInterval(() => {
    const win = getPopoutWindow();
    if (!win || win.closed) store.sandboxPopout = false; // panel comes back
  }, 500);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", onMessage);
  window.removeEventListener("pagehide", onPageHide);
  if (pollTimer) clearInterval(pollTimer);
  closePopoutWindow(); // Stop clicked, navigation $reset, or tab teardown
});
</script>
