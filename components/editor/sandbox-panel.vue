<template>
  <div class="w-full h-full flex flex-col bg-[#111] text-white min-w-0 min-h-0">
    <div class="flex items-center gap-3 px-2 py-1 bg-black text-sm flex-wrap">
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
      <button
        v-if="!popout"
        class="sandbox-btn"
        title="Move this panel into a separate window"
        @click="$emit('popout')"
      >Popout</button>
      <!-- In the editor the nav bar's Run/Stop button (hidden sm:flex) already
           closes the panel on desktop, so this is mobile-only there. The
           popout window has no nav bar, so it always needs it. -->
      <button
        :class="popout ? 'sandbox-btn' : 'sandbox-btn sm:hidden'"
        @click="$emit('close')"
      >Close</button>
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
    <div v-if="runner?.tables" class="flex items-center gap-1 px-2 py-1 bg-black/60 text-xs">
      <button
        v-for="tab in (['console', 'tables'] as const)"
        :key="tab"
        class="px-2 rounded-sm border border-white/40 capitalize"
        :class="view === tab ? 'bg-white/20' : 'hover:bg-white/10'"
        @click="selectView(tab)"
      >{{ tab }}</button>
    </div>
    <editor-sandbox-tables
      v-if="runner?.tables"
      v-show="view === 'tables'"
      :tables="tables"
      :selected="selectedTable"
      :columns="selectedColumns"
      :rows="rows.rows"
      :total="rows.total"
      :offset="rows.offset"
      :limit="ROWS_PER_PAGE"
      :sort-by="rows.sortBy"
      :sort-dir="rows.sortDir"
      :search="rows.search"
      :loading="rows.loading"
      @select="onSelectTable"
      @search="onSearch"
      @sort="onSort"
      @page="onPage"
      @refresh="requestTables"
    />
    <div
      v-show="view === 'console'"
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
        :placeholder="`Run ${runner?.replLanguage ?? 'JavaScript'} in the sandbox…`"
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
  SANDBOX_ROWS_REQUEST,
  SANDBOX_ROWS_RESULT,
  SANDBOX_TABLES_REQUEST,
  SANDBOX_TABLES_RESULT,
  parseSandboxMessage,
  type ConsoleLevel,
  type SandboxConsoleSegment,
  type SandboxTableInfo,
} from "~/lib/sandbox/protocol";
import { SANDBOX_IFRAME_SANDBOX, buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { runnersForLanguage } from "~/lib/sandbox/runners";
import type { SandboxRunner } from "~/lib/sandbox/runners/types";
import { resolveAutoRun } from "~/lib/sandbox/auto-run";

/**
 * The sandbox panel itself: toolbar, sandboxed iframe, console and REPL.
 * Deliberately props-driven and store-free so the exact same component can
 * host the panel inside the editor and inside the standalone /popout window,
 * which has no note state of its own (it is fed over postMessage).
 */
const props = defineProps<{
  content: string;
  languageId: string;
  /** Rendered inside the popout window: no Popout button, Close always shown. */
  popout?: boolean;
  /** The wrapper is dragging the width handle — don't let the iframe eat pointers. */
  resizing?: boolean;
}>();

const emit = defineEmits<{ close: []; popout: [] }>();

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

// Deployments under a subpath (the PR previews are served from
// /pr-preview/pr-<n>/) keep public/vendor behind that prefix, so runners must
// load their interpreters relative to it, not from the bare origin.
const { uiBaseURL } = useRuntimeConfig().public;

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

// Per-runner memory of the auto checkbox, for the lifetime of the panel.
const autoRunMemory = new Map<string, boolean>();

const engineId = ref("");
const availableRunners = computed(() => runnersForLanguage(props.languageId));
const runner = computed<SandboxRunner | null>(
  () =>
    availableRunners.value.find((r) => r.id === engineId.value) ??
    availableRunners.value[0] ??
    null,
);

// --- table viewer state ---------------------------------------------------
const ROWS_PER_PAGE = 50;
// Engines boot asynchronously, so the first tables request usually arrives
// before the database exists. Poll a bounded number of times instead.
const TABLES_RETRY_MS = 700;
const TABLES_MAX_TRIES = 15;

const view = ref<"console" | "tables">("console");
const tables = ref<SandboxTableInfo[]>([]);
const selectedTable = ref("");
const rows = ref({
  rows: [] as string[][],
  total: 0,
  offset: 0,
  sortBy: null as string | null,
  sortDir: "asc" as "asc" | "desc",
  search: "",
  loading: false,
});
// Monotonic id: a rows result that is not the newest request is dropped, so a
// slow page can never overwrite a newer one.
let rowsRequestId = 0;
let tablesTimer: ReturnType<typeof setTimeout> | null = null;
let tablesTries = 0;

const selectedColumns = computed(
  () => tables.value.find((t) => t.name === selectedTable.value)?.columns ?? [],
);

function postToFrame(message: Record<string, unknown>) {
  // "*" is required: the sandboxed iframe has an opaque origin. The token and
  // the iframe's own source check replace the origin check.
  iframe.value?.contentWindow?.postMessage({ ...message, token }, "*");
}

function stopTablesRetry() {
  if (tablesTimer) clearTimeout(tablesTimer);
  tablesTimer = null;
}

function requestTables() {
  if (!runner.value?.tables) return;
  stopTablesRetry();
  tablesTries = 0;
  const attempt = () => {
    postToFrame({ type: SANDBOX_TABLES_REQUEST });
    if (++tablesTries < TABLES_MAX_TRIES) {
      tablesTimer = setTimeout(attempt, TABLES_RETRY_MS);
    }
  };
  attempt();
}

function requestRows() {
  if (!selectedTable.value) return;
  rows.value.loading = true;
  postToFrame({
    type: SANDBOX_ROWS_REQUEST,
    query: {
      id: ++rowsRequestId,
      table: selectedTable.value,
      offset: rows.value.offset,
      limit: ROWS_PER_PAGE,
      sortBy: rows.value.sortBy ?? undefined,
      sortDir: rows.value.sortDir,
      search: rows.value.search || undefined,
    },
  });
}

function resetTableState() {
  stopTablesRetry();
  tables.value = [];
  selectedTable.value = "";
  rows.value = {
    rows: [],
    total: 0,
    offset: 0,
    sortBy: null,
    sortDir: "asc",
    search: "",
    loading: false,
  };
}

function selectView(tab: "console" | "tables") {
  view.value = tab;
  if (tab === "tables") requestTables();
}

function onSelectTable(name: string) {
  selectedTable.value = name;
  rows.value.offset = 0;
  rows.value.sortBy = null;
  rows.value.sortDir = "asc";
  rows.value.search = "";
  requestRows();
}

const requestRowsDebounced = debounce(requestRows, 300);

function onSearch(term: string) {
  rows.value.search = term;
  rows.value.offset = 0;
  requestRowsDebounced();
}

function onSort(column: string) {
  if (rows.value.sortBy === column) {
    rows.value.sortDir = rows.value.sortDir === "asc" ? "desc" : "asc";
  } else {
    rows.value.sortBy = column;
    rows.value.sortDir = "asc";
  }
  requestRows();
}

function onPage(direction: number) {
  rows.value.offset = Math.max(0, rows.value.offset + direction * ROWS_PER_PAGE);
  requestRows();
}

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
  resetTableState();
  token = nanoid();
  doc.value = buildSrcdoc({
    runner: runner.value,
    content: props.content,
    token,
    allowNetwork: allowNetwork.value,
    origin: window.location.origin,
    basePath: uiBaseURL as string,
  });
  if (runner.value.tables) requestTables();
}

function onMessage(event: MessageEvent) {
  if (!iframe.value || event.source !== iframe.value.contentWindow) return;
  const msg = parseSandboxMessage(event.data, token);
  if (!msg) return;
  if (msg.type === SANDBOX_TABLES_RESULT) {
    stopTablesRetry();
    tables.value = msg.tables;
    if (!tables.value.some((t) => t.name === selectedTable.value)) {
      selectedTable.value = tables.value[0]?.name ?? "";
      rows.value.offset = 0;
    }
    if (selectedTable.value) requestRows();
    return;
  }
  if (msg.type === SANDBOX_ROWS_RESULT) {
    if (msg.id !== rowsRequestId) return; // stale page
    rows.value.rows = msg.rows;
    rows.value.total = msg.total;
    rows.value.loading = false;
    return;
  }
  if (msg.type !== SANDBOX_CONSOLE_MESSAGE) return;
  if (msg.level === "clear") entries.value = [];
  else push({ level: msg.level, text: msg.args.join(" "), segments: msg.segments });
}

function submitEval() {
  const code = evalInput.value.trim();
  if (!code || !iframe.value?.contentWindow) return;
  push({ level: "input", text: "> " + code });
  view.value = "console"; // so the answer is visible
  postToFrame({ type: SANDBOX_EVAL_MESSAGE, code });
  evalInput.value = "";
}

const rerun = debounce(() => {
  if (autoRun.value) run();
}, 1000);

watch(() => props.content, () => rerun());
watch(allowNetwork, run);
watch(availableRunners, (list) => {
  if (!list.some((r) => r.id === engineId.value)) engineId.value = list[0]?.id ?? "";
});

watch(runner, (r, old) => {
  if (!r) {
    emit("close");
    return;
  }
  if (r.id === old?.id) return;
  // Engine or language switched while the panel is open: never leave the
  // previous runner's document on screen. Heavy interpreters default to
  // manual runs so typing doesn't re-download/boot a wasm VM every second —
  // but only until the user says otherwise for that runner.
  autoRun.value = resolveAutoRun(autoRunMemory, old?.id ?? null, autoRun.value, r);
  if (!r.tables) view.value = "console";
  if (autoRun.value) run();
  else {
    entries.value = [];
    resetTableState();
    doc.value = "";
  }
});

onMounted(() => {
  window.addEventListener("message", onMessage);
  engineId.value = availableRunners.value[0]?.id ?? "";
  autoRun.value = runner.value
    ? resolveAutoRun(autoRunMemory, null, autoRun.value, runner.value)
    : true;
  run();
});

onBeforeUnmount(() => {
  window.removeEventListener("message", onMessage);
  stopTablesRetry();
});
</script>

<style scoped>
.sandbox-btn {
  @apply border border-white/40 px-2 rounded-sm hover:bg-white/10;
}
</style>
