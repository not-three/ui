<template>
  <div class="base-container">
    <notification-box />
    <badge-pr />
    <dialog-base />
    <loading-spinner :visible="loading > 0 || store.loading" />
    <file-upload />
    <transition-fade>
      <file-download v-if="openFile && loading <= 0" :file="openFile" />
    </transition-fade>
    <navigation-bar />
    <monaco-editor @loaded="loading--" />
  </div>
</template>

<script lang="ts" setup>
import { Crypto, FragmentData, Not3Client, ShareGenerator } from "@not3/sdk";
import { OkDialog, TextOutputDialog, YesNoDialog } from "~/lib/dialog";
import axios, { AxiosError } from "axios";
import { DownloadDb } from "~/lib/download";

const { uiBaseURL } = useRuntimeConfig().public;
const store = useAppStore();
const settings = useSettingsStore();
const loading = ref(2);
const props = defineProps<{
  openFile?: string;
  openNote?: string;
  openSettings?: boolean;
}>();

// event to register in the dom to prevent closing the app if unsaved changes
function beforeDomUnload(event: BeforeUnloadEvent) {
  if (store.content !== "" && !store.readonly) {
    event.preventDefault();
    event.returnValue = true; // Legacy
  }
}

onMounted(async () => {
  window.addEventListener("beforeunload", beforeDomUnload);
  const lastContent = store.keepContent ? store.content : "";
  store.$reset();
  store.content = lastContent;
  store.id = props.openNote || "";

  if (window.location.hash === "#duplicate") {
    console.log("Duplicating content...");
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
    if (store.content.startsWith('{"type":"EXCALIDRAW",')) try {
      JSON.parse(store.content);
      store.excalidraw = true;
    } catch {/* ignored */}
    const share = new URL(window.location.href).searchParams.get('share');
    const copy = (t: string) => navigator.clipboard.writeText(t);
    if (share) {
      const url = new URL(window.location.href);
      url.searchParams.delete('share');
      window.history.replaceState({}, '', url.toString());
    }
    if (share === 'url') {
      store.dialog = new TextOutputDialog(
        "Share Link",
        "Copy the following link to share the note.",
        window.location.href,
      );
      copy(window.location.href);
    } else if (share === 'curl') {
      const fragment = FragmentData.fromURL(window.location.href);
      let apiUrl = fragment.server || store.config.baseURL;
      if (!apiUrl.startsWith("http")) apiUrl = window.location.origin + apiUrl;
      const cmd = new ShareGenerator({apiUrl}).noteCurl(store.id, fragment.seed);
      store.dialog = new TextOutputDialog(
        "cURL Command",
        "Copy the following cURL command to share the note.",
        cmd,
      );
      copy(cmd);
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response && error.response.status === 404) {
      errorMsg = "The note (probably) expired.";
    }
    errorMsg += ' Check the URL and try again.';
    store.dialog = new OkDialog("Error", errorMsg, () => useRouter().push("/"));
  } else if (props.openSettings) {
    store.settings = true;
    store.content = JSON.stringify(useSettingsStore().$state, null, 2);
  }

  loading.value--;

  const runningDownload = localStorage.getItem("running-download");
  if (runningDownload) {
    const diff = Date.now() - parseInt(runningDownload);
    const FIVE_MINUTES = 5 * 60 * 1000;
    if (diff > FIVE_MINUTES) return;
    console.warn("Found stale download in progress. Resetting...");
    localStorage.removeItem("running-download");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    DownloadDb.reset();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeDomUnload);
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
