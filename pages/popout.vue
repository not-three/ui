<template>
  <div class="w-screen h-screen bg-[#111]">
    <editor-sandbox-panel
      v-if="connected"
      :content="content"
      :language-id="languageId"
      popout
      @close="selfClose"
    />
    <div
      v-else
      class="h-full flex items-center justify-center text-white/70 font-mono text-sm px-8 text-center"
    >
      Waiting for the editor… This window only works when opened via the
      editor's Popout button, and closes with the editor tab.
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  POPOUT_READY_MESSAGE,
  POPOUT_STATE_MESSAGE,
  parsePopoutMessage,
} from "~/lib/sandbox/popout-bridge";

/**
 * Standalone host for the sandbox panel. This document is app-origin, so it
 * only ever trusts messages that come from its own opener on its own origin;
 * the note code still runs in the nested opaque-origin sandboxed iframe that
 * sandbox-panel.vue creates. Nothing runs until the opener sends state.
 */
useHead({ title: "!3 Run / Preview" });

const content = ref("");
const languageId = ref("plaintext");
const connected = ref(false);
let pollTimer: ReturnType<typeof setInterval> | null = null;

function onMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return;
  if (!window.opener || event.source !== window.opener) return;
  const msg = parsePopoutMessage(event.data);
  if (msg?.type !== POPOUT_STATE_MESSAGE) return;
  content.value = msg.content;
  languageId.value = msg.languageId;
  connected.value = true;
}

function selfClose() {
  window.close();
}

onMounted(() => {
  if (!window.opener) return; // leaves the "waiting" hint on screen
  window.addEventListener("message", onMessage);
  window.opener.postMessage({ type: POPOUT_READY_MESSAGE }, window.location.origin);
  // If the opener tab dies without managing to close us (crash, task-kill),
  // notice and close ourselves.
  pollTimer = setInterval(() => {
    if (!window.opener || window.opener.closed) window.close();
  }, 1000);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", onMessage);
  if (pollTimer) clearInterval(pollTimer);
});
</script>
