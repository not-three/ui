<template>
  <div class="base-container">
    <misc-notification-box />
    <badge-pr />
    <dialog-base />
    <misc-loading-spinner :visible="loading > 0 || store.loading" />
    <file-upload />
    <p2p-send />
    <cowork-share />
    <transition-fade>
      <file-p2p-receive v-if="openFile && loading <= 0 && fileIsP2P" :file="openFile" />
      <file-download v-else-if="openFile && loading <= 0" :file="openFile" />
    </transition-fade>
    <navigation-bar />
    <editor-monaco @loaded="loading--" />
  </div>
</template>

<script lang="ts" setup>
import { Crypto, FragmentData, Not3Client } from "@not3/sdk";
import { OkDialog, YesNoDialog } from "~/lib/dialog";
import axios, { AxiosError } from "axios";
import { DownloadDb } from "~/lib/download";
import * as Actions from "~/lib/actions";
import { isP2PFragment } from "~/lib/transfer/p2p";
import { activeCowork, leaveCowork } from '~/lib/cowork/active';
import { joinCowork } from '~/lib/actions/start-cowork';
import { installPageKeybindings } from "~/lib/keybindings/page-adapter";
import { getKeybindingResolver, getKeymapView, setUserKeybindings } from "~/lib/keybindings/runtime";
import { dispatchNot3Action } from "~/lib/monaco/editor-actions";

const { uiBaseURL } = useRuntimeConfig().public;
const store = useAppStore();
const settings = useSettingsStore();
const loading = ref(2);
const props = defineProps<{
  openFile?: string;
  openNote?: string;
  openSettings?: boolean;
  coworkRoom?: string;
  openKeybindings?: boolean;
}>();
const fileIsP2P = computed(() => !!props.openFile && isP2PFragment(window.location.href));
let stopPageKeys: (() => void) | null = null;

watch(() => settings.keybindings, (value) => setUserKeybindings(value), { deep: true });

// event to register in the dom to prevent closing the app if unsaved changes
function beforeDomUnload(event: BeforeUnloadEvent) {
  if (store.content !== "" && !store.readonly) {
    event.preventDefault();
    event.returnValue = true; // Legacy
  }
}

onMounted(async () => {
  setUserKeybindings(settings.keybindings);
  stopPageKeys = installPageKeybindings(window, getKeybindingResolver, dispatchNot3Action);
  window.addEventListener("beforeunload", beforeDomUnload);
  leaveCowork();
  const lastContent = store.keepContent ? store.content : "";
  // keepContent marks the readonly->editable handoff; keep the run/preview
  // panel open across it (the user explicitly opened it for this content).
  const keepSandbox = store.keepContent && store.sandbox;
  store.$reset();
  store.content = lastContent;
  store.sandbox = keepSandbox;
  store.id = props.openNote || "";

  if (window.location.hash === "#duplicate") {
    window.addEventListener("message", (event) => {
      if (event.data && event.data.tag === "set-content") {
        store.content = event.data.content;
        store.keepContent = true;
        store.pushToRouter("/", true);
      }
    });
    window.opener.postMessage("get-content", "*");
    window.parent.postMessage("get-content", "*");
  }

  store.config = (await axios.get((uiBaseURL || '/') + "config.json")).data;
  store.api = new Not3Client({
    baseUrl: settings.customServer.url || store.config.baseURL,
    password: settings.customServer.password || undefined,
  });
  try {
    const sysApi = store.api.system();
    if (!await store.api.isCompatible(sysApi)) {
      const msg = "API is not compatible with this version of the client.";
      store.dialog = new OkDialog("Error", msg);
      console.error(msg);
      console.error("API version:", await sysApi.info().then((r) => r.version));
      console.error("Compatible versions:", store.api.getVersionRange());
    } else {
      store.info = await sysApi.info();
      console.info("API version:", store.info.version);
    }
  } catch (error) {
    const msg = "Failed to connect to the API.";
    store.dialog = new OkDialog("Error", msg);
    console.error(msg);
    console.error(error);
  }

  let errorMsg = "";
  if (props.openNote) try {
    errorMsg = "Could not load cryptographic data from URL.";
    const fragment = FragmentData.fromURL(window.location.href);
    errorMsg = "Could not generate cryptographic key.";
    const key = await Crypto.generateKey(fragment.seed);
    errorMsg = "Could not load note data from the server.";
    const api = fragment.server ? new Not3Client({ baseUrl: fragment.server }) : store.api;
    if (
      fragment.server &&
      settings.warnings.unknownServer &&
      settings.customServer.url !== fragment.server &&
      !settings.trustedServers.includes(fragment.server)
    ) {
      await new Promise<void>((resolve) => store.dialog = new YesNoDialog(
        "Warning",
        [
          "This note is hosted on a private server:",
          fragment.server + "\n",
          "Do you trust this server?",
          "(Your IP address will be sent to the server.)",
        ].join("\n"),
        () => {
          settings.trustedServers.push(fragment.server!);
          resolve();
        },
        () => useRouter().push("/"),
      ))
    }
    if (fragment.selfDestruct) {
      await new Promise<void>((resolve) => store.dialog = new YesNoDialog(
        "Warning",
        [
          "This note will self-destruct after reading.",
          "Do you want to continue?",
        ].join("\n"),
        resolve,
        () => useRouter().push("/"),
      ));
    }
    const note = await api.notes().get(props.openNote);
    errorMsg = "Decryption failed.";
    store.content = await Crypto.decrypt(note.content, key);
    store.readonly = true;
    store.expires = new Date(note.expiresAt * 1000);

    if (note.mime) setTimeout(() => {
      const detected = store.languageDefinitions.find(x => x.id === store.detectedLanguage);
      const selected = store.languageDefinitions.find(x => x.mimeTypes.includes(note.mime!));
      if (!detected || !selected) return;
      if (detected.id === selected.id) return;
      store.selectedLanguage = selected.id;
    }, 100);

    if (store.content.startsWith('{"type":"EXCALIDRAW",')) try {
      JSON.parse(store.content);
      store.excalidraw = true;
    } catch {/* ignored */}

    const share = new URL(window.location.href).searchParams.get('share');
    if (share) {
      const url = new URL(window.location.href);
      url.searchParams.delete('share');
      window.history.replaceState({}, '', url.toString());
      const map = {
        'url': Actions.SHARE_LINK,
        'curl': Actions.SHARE_CURL,
      } as Record<string, () => void>;
      if (map[share]) map[share]();
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response && error.response.status === 404) {
      errorMsg = "The note (probably) expired.";
    }
    errorMsg += ' Check the URL and try again.';
    store.dialog = new OkDialog("Error", errorMsg, () => useRouter().push("/"));
  } else if (props.coworkRoom) {
    await joinCowork(props.coworkRoom, window.location.href);
  } else if (props.openSettings) {
    store.settings = true;
    store.content = JSON.stringify(useSettingsStore().$state, null, 2);
  } else if (props.openKeybindings) {
    store.readonly = true;
    store.selectedLanguage = "json";
    store.content = getKeymapView();
  }

  loading.value--;

  const runningDownload = localStorage.getItem("running-download");
  if (runningDownload) {
    // An actively downloading tab refreshes this timestamp every second, so
    // anything older than 10s is a leftover from a crashed or killed tab.
    const diff = Date.now() - parseInt(runningDownload);
    if (diff > 10_000) {
      console.warn("Found stale download lock. Resetting...");
      localStorage.removeItem("running-download");
      DownloadDb.reset();
    }
  }
});

onBeforeUnmount(() => {
  stopPageKeys?.();
  window.removeEventListener("beforeunload", beforeDomUnload);
  leaveCowork();
});

watch(() => activeCowork.value?.session.state.language, language => {
  if (language) store.selectedLanguage = language;
});
watch(() => [store.selectedLanguage, store.detectedLanguage] as const, ([selected, detected]) => {
  const session = activeCowork.value?.session;
  if (!session || session.kind !== 'text') return;
  const language = selected || detected || 'plaintext';
  if (session.isCreator && language !== session.language) void session.setLanguage(language);
  else if (!session.isCreator && session.language && language !== session.language) store.selectedLanguage = session.language;
});

console.warn(
  "%cWARNING:\n%cNever paste any code/text here unless you know EXACTLY what you are doing.",
  "color: red; font-weight: bold; font-size: 4em;",
  "font-size: 2em;",
);
</script>

<style>
.base-container {
  @apply w-screen h-screen bg-[#1e1e1e] overflow-hidden flex flex-col;
}
button {
  @apply select-none;
}
</style>
