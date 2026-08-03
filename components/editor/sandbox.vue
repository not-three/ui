<template>
  <div class="w-full sm:w-1/2 flex-shrink-0 h-full flex flex-col bg-[#111] border-l border-black text-white min-w-0">
    <div class="flex items-center gap-3 px-2 py-1 bg-black text-sm">
      <span class="font-bold select-none">{{ mode === "html" ? "HTML Preview" : "JS Console" }}</span>
      <button class="sandbox-btn" @click="run">Run</button>
      <button class="sandbox-btn" @click="entries = []">Clear</button>
      <label class="flex items-center gap-1 select-none cursor-pointer" title="Re-run automatically when the note changes">
        <input v-model="autoRun" type="checkbox"> auto
      </label>
      <label
        class="flex items-center gap-1 select-none cursor-pointer"
        title="Allow the sandbox to load resources from and connect to https:// hosts. Off by default so note code cannot send data anywhere."
      >
        <input v-model="allowNetwork" type="checkbox"> network
      </label>
      <div class="flex-grow" />
      <button class="sandbox-btn" @click="store.sandbox = false">Close</button>
    </div>
    <iframe
      ref="iframe"
      :srcdoc="doc"
      :sandbox="SANDBOX_IFRAME_SANDBOX"
      referrerpolicy="no-referrer"
      :class="mode === 'html' ? 'w-full flex-grow bg-white border-none' : 'hidden'"
    />
    <div
      ref="output"
      class="overflow-y-auto font-mono text-xs px-2 py-1"
      :class="mode === 'html' ? 'h-48 border-t border-black flex-shrink-0' : 'flex-grow basis-0'"
    >
      <div
        v-for="(entry, i) in entries"
        :key="i"
        class="whitespace-pre-wrap break-all"
        :class="LEVEL_CLASSES[entry.level]"
      >{{ entry.text }}</div>
    </div>
    <form class="flex items-center border-t border-black" @submit.prevent="submitEval">
      <span class="pl-2 pr-1 py-1 text-green-400 font-mono text-xs select-none">&gt;</span>
      <input
        v-model="evalInput"
        class="flex-grow bg-transparent font-mono text-xs py-1 pr-2 outline-none"
        placeholder="Run JavaScript in the sandbox…"
      >
    </form>
  </div>
</template>

<script lang="ts" setup>
import { nanoid } from "nanoid";
import { debounce } from "~/lib/monaco/utils";
import {
  SANDBOX_CONSOLE_MESSAGE,
  SANDBOX_EVAL_MESSAGE,
  parseSandboxMessage,
  type ConsoleLevel,
} from "~/lib/sandbox/protocol";
import {
  SANDBOX_IFRAME_SANDBOX,
  buildSrcdoc,
  sandboxModeForLanguage,
  type SandboxMode,
} from "~/lib/sandbox/srcdoc";

const MAX_ENTRIES = 500;

type Entry = { level: ConsoleLevel | "input"; text: string };

const LEVEL_CLASSES: Record<string, string> = {
  log: "text-gray-100",
  info: "text-blue-300",
  warn: "text-yellow-400",
  error: "text-red-400",
  debug: "text-gray-500",
  input: "text-green-400",
};

const store = useAppStore();
const iframe = ref<HTMLIFrameElement>();
const output = ref<HTMLDivElement>();
const entries = ref<Entry[]>([]);
const evalInput = ref("");
const autoRun = ref(true);
const allowNetwork = ref(false);
const doc = ref("");
// Random per-run token: parent only trusts messages carrying it, the
// iframe only evaluates REPL input carrying it.
let token = "";

const mode = computed<SandboxMode | null>(() =>
  sandboxModeForLanguage(store.getCurrentLanguage().id),
);

function push(entry: Entry) {
  entries.value.push(entry);
  if (entries.value.length > MAX_ENTRIES) {
    entries.value.splice(0, entries.value.length - MAX_ENTRIES);
  }
  nextTick(() => output.value?.scrollTo({ top: output.value.scrollHeight }));
}

function run() {
  if (!mode.value) return;
  entries.value = [];
  token = nanoid();
  doc.value = buildSrcdoc({
    mode: mode.value,
    content: store.content,
    token,
    allowNetwork: allowNetwork.value,
  });
}

function onMessage(event: MessageEvent) {
  if (!iframe.value || event.source !== iframe.value.contentWindow) return;
  const msg = parseSandboxMessage(event.data, token);
  if (!msg || msg.type !== SANDBOX_CONSOLE_MESSAGE) return;
  if (msg.level === "clear") entries.value = [];
  else push({ level: msg.level, text: msg.args.join(" ") });
}

function submitEval() {
  const code = evalInput.value.trim();
  if (!code || !iframe.value?.contentWindow) return;
  push({ level: "input", text: "> " + code });
  // "*" is required: the sandboxed iframe has an opaque origin. The token
  // and the source check inside the iframe replace the origin check.
  iframe.value.contentWindow.postMessage(
    { type: SANDBOX_EVAL_MESSAGE, token, code },
    "*",
  );
  evalInput.value = "";
}

const rerun = debounce(() => {
  if (autoRun.value) run();
}, 1000);

watch(() => store.content, () => rerun());
watch(allowNetwork, run);
watch(mode, (m) => {
  if (!m) store.sandbox = false;
});

onMounted(() => {
  window.addEventListener("message", onMessage);
  run();
});

onBeforeUnmount(() => {
  window.removeEventListener("message", onMessage);
});
</script>

<style scoped>
.sandbox-btn {
  @apply border border-white/40 px-2 rounded-sm hover:bg-white/10;
}
</style>
