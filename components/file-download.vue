<template>
  <overlay-container class="z-30">
    <div class="p-4 w-[80vw] max-w-xs">
      <div class="border-white border-8 aspect-square w-full flex justify-center items-center">
        <transition-fade>
          <icon v-if="!started" name="lucide:file" class="text-8xl absolute" />
          <icon v-if="finished" name="lucide:file" class="text-8xl absolute text-black" />
        </transition-fade>
        <progress-square v-if="started" :status="progress" :total="totalChunks" class="w-full h-full" />
      </div>
    </div>
    <div class="bg-black border-white/20 border-2 p-2 max-w-md">
      <div class="grid grid-cols-[1fr,auto] gap-4">
        <p class="truncate">{{ meta?.name }}</p>
        <p>{{ size }}</p>
      </div>
      <div class="flex justify-center mt-4 gap-4">
        <button
          v-if="!started"
          class="border-white border-2 px-2 py-1 disabled:cursor-progress"
          @click="showCurl"
        >
          Show cURL Command
        </button>
        <button
          :disabled="started && !finished"
          class="border-white border-2 px-2 py-1 disabled:cursor-progress"
          @click="startDownload"
        >
          {{ finished ? 'Save File' : started ? 'Downloading...' : 'Download File' }}
        </button>
        <button
          class="border-white border-2 px-2 py-1 disabled:cursor-not-allowed"
          @click="doCloseOrCancel"
        >
          {{ started && !finished ? 'Cancel' : 'Close' }}
        </button>
      </div>
    </div>
  </overlay-container>
</template>

<script lang="ts" setup>
import type { FileGetResponse } from '@not3/sdk';
import { Not3Client, FileDownload, FragmentData, ShareGenerator } from '@not3/sdk';
import { AxiosError } from 'axios';
import { OkDialog, TextOutputDialog, YesNoDialog } from '~/lib/dialog';
import { DownloadDb } from '~/lib/download';

const store = useAppStore();
const props = defineProps<{
  file: string;
}>();

const started = ref(false);
const finished = ref(false);
const download = ref<FileDownload|null>(null);
const meta = ref<FileGetResponse|null>(null);
const size = computed(() => {
  if (!meta.value) return "";
  const size = meta.value.size;
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${size} B`;
});
const totalChunks = ref(0);
const progress = ref(0);
let canceled = false;
let blobDownloadUrl: string|null = null;
let apiUrl = "";
let seed = "";

onMounted(async () => {
  let errorMsg = "";
  try {
    store.loading = true;
    errorMsg = "Could not load cryptographic data from URL.";
    const fragment = FragmentData.fromURL(window.location.href);
    seed = fragment.seed;
    errorMsg = "Could not load file data from the server.";
    const api = fragment.server ? new Not3Client({ baseUrl: fragment.server }) : store.api;
    apiUrl = api.getOptions().baseUrl;
    if (!apiUrl.toLowerCase().startsWith("http")) {
      apiUrl = window.location.origin + apiUrl;
    }
    download.value = new FileDownload(api.files(), props.file, fragment.seed);
    await download.value.prepare();
    meta.value = download.value.getFileMetadata();
    totalChunks.value = download.value.getTotalChunks();
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response && error.response.status === 404) {
      errorMsg = "The file (probably) expired.";
    }
    errorMsg += ' Check the URL and try again.';
    store.dialog = new OkDialog("Error", errorMsg, () => useRouter().push("/"));
  } finally {
    store.loading = false;
  }
})

async function doCloseOrCancel() {
  if (started.value && !finished.value) {
    canceled = true;
    DownloadDb.reset();
    window.location.reload();
  } else {
    useRouter().push("/");
  }
}

async function startDownload() {
  if (blobDownloadUrl) {
    const a = document.createElement("a");
    a.href = blobDownloadUrl;
    a.download = meta.value?.name || "file";
    a.click();
  }
  if (!download.value || started.value) return;
  if (localStorage.getItem("running-download")) {
    store.dialog = new YesNoDialog("Warning", "Another download seems to be in progress. Do you want to cancel it?", async () => {
      localStorage.removeItem("running-download");
      store.loading = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      store.loading = false;
      await startDownload();
    });
    return;
  }
  window.addEventListener("beforeunload", DownloadDb.reset);
  localStorage.setItem("running-download", Date.now().toString());
  const cancelCheckInterval = window.setInterval(() => {
    if (!localStorage.getItem("running-download")) {
      window.clearInterval(cancelCheckInterval);
      doCloseOrCancel();
    } else {
      localStorage.setItem("running-download", Date.now().toString());
    }
  }, 1000);
  started.value = true;
  const db = await DownloadDb.open();
  await download.value.start(async (buf, index) => {
    if (canceled) return;
    progress.value = index + 1;
    await db.write(index, buf);
  });
  finished.value = true;
  blobDownloadUrl = URL.createObjectURL(await db.getFullBlob());
  window.clearInterval(cancelCheckInterval);
  startDownload();
}

function showCurl() {
  const url = new ShareGenerator({apiUrl}).fileCurl(
    props.file,
    seed,
    meta.value?.name || "file",
  );
  store.dialog = new TextOutputDialog(
    "cURL Command",
    [
      "This command will download the file on the command line,",
      "using openssl, curl, base64, xxd, head and tail to decrypt it.",
    ].join(" "),
    url,
  );
  navigator.clipboard.writeText(url);
}
</script>
