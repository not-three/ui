<template>
  <div
    ref="root"
    class="w-full sm:w-[var(--sandbox-w)] flex-shrink-0 h-full flex flex-col bg-[#111] border-l border-black text-white min-w-0 relative"
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
    <div class="flex items-center gap-3 px-2 py-1 bg-black text-sm">
      <span class="font-bold select-none">{{ runner?.label || "Sandbox" }}</span>
      <select
        v-if="availableRunners.length > 1"
        v-model="engineId"
        class="bg-black border border-white/40 rounded-sm text-xs py-0.5"
        title="Execution engine for this language"
      >
        <option v-for="r in availableRunners" :key="r.id" :value="r.id">{{ r.label }}</option>
      </select>
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
      <button class="sandbox-btn" title="Open in a separate window" @click="popout">Popout</button>
      <button class="sandbox-btn" @click="store.sandbox = false">Close</button>
    </div>
    <iframe
      ref="iframe"
      :srcdoc="doc"
      :sandbox="SANDBOX_IFRAME_SANDBOX"
      referrerpolicy="no-referrer"
      :class="[
        runner?.layout === 'preview' ? 'w-full flex-grow bg-white border-none' : 'hidden',
        resizing ? 'pointer-events-none' : '',
      ]"
    />
    <div
      ref="output"
      class="overflow-y-auto font-mono text-xs px-2 py-1"
      :class="runner?.layout === 'preview' ? 'h-48 border-t border-black flex-shrink-0' : 'flex-grow basis-0'"
    >
      <div
        v-for="(entry, i) in entries"
        :key="i"
        class="whitespace-pre-wrap break-all"
        :class="LEVEL_CLASSES[entry.level]"
      ><span v-for="(segment, j) in segmentsOf(entry)" :key="j" :style="segment.css">{{ segment.text }}</span></div>
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
  type SandboxConsoleSegment,
} from "~/lib/sandbox/protocol";
import { SANDBOX_IFRAME_SANDBOX, buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { runnersForLanguage } from "~/lib/sandbox/runners";
import type { SandboxRunner } from "~/lib/sandbox/runners/types";
import { buildPopoutDocument } from "~/lib/sandbox/popout";
import { OkDialog } from "~/lib/dialog";

const MAX_ENTRIES = 500;

// segments is set for `%c` styled logs; their css is sanitized by
// parseSandboxMessage before it ever reaches an inline style attribute.
type Entry = {
  level: ConsoleLevel | "input";
  text: string;
  segments?: SandboxConsoleSegment[];
};

const LEVEL_CLASSES: Record<string, string> = {
  log: "text-gray-100",
  info: "text-blue-300",
  warn: "text-yellow-400",
  error: "text-red-400",
  debug: "text-gray-500",
  input: "text-green-400",
};

const MIN_WIDTH_PCT = 20;
const MAX_WIDTH_PCT = 80;

const store = useAppStore();
const iframe = ref<HTMLIFrameElement>();
const output = ref<HTMLDivElement>();
const root = ref<HTMLDivElement>();
const widthPct = ref(50);
const resizing = ref(false);
const entries = ref<Entry[]>([]);
const evalInput = ref("");
const autoRun = ref(true);
const allowNetwork = ref(false);
const doc = ref("");
// Random per-run token: parent only trusts messages carrying it, the
// iframe only evaluates REPL input carrying it.
let token = "";

const engineId = ref("");
const availableRunners = computed(() =>
  runnersForLanguage(store.getCurrentLanguage().id),
);
const runner = computed<SandboxRunner | null>(
  () =>
    availableRunners.value.find((r) => r.id === engineId.value) ??
    availableRunners.value[0] ??
    null,
);

function segmentsOf(entry: Entry): SandboxConsoleSegment[] {
  return entry.segments ?? [{ text: entry.text, css: "" }];
}

function push(entry: Entry) {
  entries.value.push(entry);
  if (entries.value.length > MAX_ENTRIES) {
    entries.value.splice(0, entries.value.length - MAX_ENTRIES);
  }
  nextTick(() => output.value?.scrollTo({ top: output.value.scrollHeight }));
}

function run() {
  if (!runner.value) return;
  entries.value = [];
  token = nanoid();
  doc.value = buildSrcdoc({
    runner: runner.value,
    content: store.content,
    token,
    allowNetwork: allowNetwork.value,
    origin: window.location.origin,
  });
}

function popout() {
  if (!runner.value) return;
  if (!doc.value) run();
  const win = window.open("", "_blank", "width=960,height=720");
  if (!win) {
    store.dialog = new OkDialog(
      "Popup blocked",
      "Your browser blocked the popout window. Allow popups for this site and try again.",
    );
    return;
  }
  win.document.open();
  win.document.write(
    buildPopoutDocument({
      title: `!3 ${runner.value.label}`,
      srcdoc: doc.value,
      token,
      layout: runner.value.layout,
    }),
  );
  win.document.close();
}

function onMessage(event: MessageEvent) {
  if (!iframe.value || event.source !== iframe.value.contentWindow) return;
  const msg = parseSandboxMessage(event.data, token);
  if (!msg || msg.type !== SANDBOX_CONSOLE_MESSAGE) return;
  if (msg.level === "clear") entries.value = [];
  else push({ level: msg.level, text: msg.args.join(" "), segments: msg.segments });
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

const rerun = debounce(() => {
  if (autoRun.value) run();
}, 1000);

watch(() => store.content, () => rerun());
watch(allowNetwork, run);
watch(availableRunners, (list) => {
  if (!list.some((r) => r.id === engineId.value)) engineId.value = list[0]?.id ?? "";
});

watch(runner, (r, old) => {
  if (!r) {
    store.sandbox = false;
    return;
  }
  if (r.id === old?.id) return;
  // Engine or language switched while the panel is open: never leave the
  // previous runner's document on screen. Heavy interpreters default to
  // manual runs so typing doesn't re-download/boot a wasm VM every second.
  autoRun.value = !r.heavy;
  if (autoRun.value) run();
  else {
    entries.value = [];
    doc.value = "";
  }
});

onMounted(() => {
  window.addEventListener("message", onMessage);
  engineId.value = availableRunners.value[0]?.id ?? "";
  autoRun.value = !runner.value?.heavy;
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
