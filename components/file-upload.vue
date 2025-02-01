<template>
  <transition-fade>
    <overlay-container v-if="store.upload" class="z-30" :file-drop="true" @file-drop="selectFile">
      <div class="p-4 w-[80vw] max-w-xs">
        <div class="border-white border-8 aspect-square w-full flex justify-center items-center">
          <transition-fade>
            <icon v-if="!upload" name="lucide:file" class="text-8xl absolute" />
          </transition-fade>
          <progress-square v-if="upload" :status="progress" :total="totalChunks" class="w-full h-full" />
        </div>
      </div>
      <div class="bg-black border-white/20 border-2 p-2 max-w-md">
        <div class="grid grid-cols-[1fr,auto] gap-4 justify-center items-center">
          <p class="truncate">{{ fileName || 'No file selected...' }}</p>
          <button class="border-white border-2 px-2 py-1" @click="openFileSelect">Select File</button>
        </div>
        <div class="flex justify-center mt-4 gap-4">
          <button
            :disabled="!!upload || !file"
            :class="{ 'cursor-not-allowed': !file, 'cursor-progress': upload }"
            class="border-white border-2 px-2 py-1"
            @click="startUpload"
          >
            {{ upload ? 'Uploading...' : 'Start Upload' }}
          </button>
          <button
            class="border-white border-2 px-2 py-1 disabled:cursor-not-allowed"
            @click="doCloseOrCancel"
          >
            {{ upload ? 'Cancel' : 'Close' }}
          </button>
        </div>
      </div>
    </overlay-container>
  </transition-fade>
</template>

<script lang="ts" setup>
import { FileUpload, FragmentData, type FileUploadProgress } from '@not3/sdk';
import { readRecoveryData, writeRecoveryData, type UploadRecoveryData } from '~/lib/upload';
import { OkDialog, YesNoDialog } from '~/lib/dialog';
import { AxiosError } from 'axios';

const fileName = ref("");
const store = useAppStore();
const notifications = useNotificationStore();
const progress = ref<FileUploadProgress>({});
const totalChunks = ref(0);
const fileSize = ref(0);
const file = ref<File|null>(null);
const upload = ref<FileUpload|null>(null);
const recoveryInterval = ref<null|number>(null);

const DIALOG_TAG = 'recovery';

onMounted(() => {
  recoveryInterval.value = window.setInterval(() => {
    if (upload.value) {
      if (store.dialog && store.dialog.tag === DIALOG_TAG) store.dialog = null;
      writeRecoveryData({
        id: upload.value.getID(),
        seed: upload.value.getSeed(),
        name: fileName.value,
        size: fileSize.value,
        progress: progress.value,
      })
    } else {
      const data = readRecoveryData();
      if (!data) {
        if (store.dialog && store.dialog.tag === DIALOG_TAG) store.dialog = null;
      } else if (data.lastModified + 500 < Date.now()) {
        if (store.dialog && store.dialog.tag === DIALOG_TAG) return;
        store.dialog = new YesNoDialog(
          "Recovery", 
          "It seems there was an upload in progress which was interrupted. Would you like to continue?",
          () => recoverUpload(),
          () => writeRecoveryData(null),
        );
        store.dialog.tag = DIALOG_TAG;
      }
    }
  }, 250);
})

onBeforeUnmount(() => {
  if (recoveryInterval.value) window.clearInterval(recoveryInterval.value);
})

function handleUploadError(e: unknown) {
  console.error("Upload Error", e);
  upload.value = null;
  let msg = "An error occurred while uploading the file.";
  if (e instanceof AxiosError && e.response) {
    if (e.response.data && e.response.data.message) msg = String(e.response.data.message);
  }
  store.dialog = new OkDialog("Error", msg);
  store.dialog.tag = upload.value ? DIALOG_TAG : '';
}

function finalizeUpload() {
  if (!upload.value) return;
  writeRecoveryData(null);
  const { baseUrl } = store.api.getOptions();
  const fragment = new FragmentData({
    seed: upload.value.getSeed(),
    server: baseUrl === store.config.baseURL ? undefined : baseUrl,
  })
  useRouter().push(`/f/${upload.value.getID()}#${fragment.toString()}`);
  upload.value = null;
  doCloseOrCancel();
}

function sanitizeFileName(name: string) {
  return name.replaceAll(/[^a-zA-Z0-9-.]/g, "_");
}

async function recoverUploadHandler(event: Event, data: UploadRecoveryData): Promise<boolean> {
  if (!(event.target instanceof HTMLInputElement)) return false;
  const files = event.target.files;
  if (!files || files.length === 0) return false;
  const file = files[0];
  if (sanitizeFileName(file.name) !== data.name || file.size !== data.size) return false;
  fileName.value = data.name;
  fileSize.value = data.size;
  upload.value = new FileUpload(store.api.files(), data.name, data.size, 4, false, data.seed);
  totalChunks.value = upload.value.getChunkCount();
  upload.value.onProgress((p) => {progress.value = p});
  try {
    await upload.value.resume((start, end) => {
      if (!file) throw new Error("Cant read file");
      return file.slice(start, end).arrayBuffer();
    }, { id: data.id, progress: data.progress });
    finalizeUpload();
  } catch (e: unknown) {
    handleUploadError(e);
  }
  return true;
}

async function recoverUpload(event?: Event) {
  const data = readRecoveryData();
  if (!data) return;
  if (event && await recoverUploadHandler(event, data)) return;
  store.upload = true;
  store.dialog = new YesNoDialog(
    "Recovery",
    [
      "Please select the same file to continue the upload.\n",
      `File: ${data.name}`,
      `Size: ${data.size} bytes`,
    ].join("\n"),
    () => {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = recoverUpload;
      input.click();
    },
    () => writeRecoveryData(null),
  )
  store.dialog.tag = DIALOG_TAG;
}

async function startUpload() {
  if (upload.value) return;
  if (!file.value) return;
  upload.value = new FileUpload(store.api.files(), fileName.value, file.value.size, 4, false);
  upload.value.onProgress((p) => {progress.value = p});
  totalChunks.value = upload.value.getChunkCount();
  try {
    await upload.value.start(async (start, end) => {
      if (!file.value) throw new Error("Cant read file");
      return file.value.slice(start, end).arrayBuffer();
    });
    finalizeUpload();
  } catch (e) {
    handleUploadError(e);
  }
}

function doCloseOrCancel() {
  if (upload.value) {
    upload.value.cancel();
  } else {
    store.upload = false;
    fileName.value = "";
    file.value = null;
  }
}

function selectFile(files: FileList) {
  if (upload.value) return;
  if (files.length === 0) return;
  if (files.length > 1) return notifications.show("Only one file can be uploaded at a time.");
  const fileSizeInMB = files[0].size / 1024 / 1024;
  if (fileSizeInMB > store.info.fileTransferMaxSize * 0.98) {
    return notifications.show(`File size exceeds the maximum limit of ${store.info.fileTransferMaxSize} MB.`);
  }
  fileName.value = sanitizeFileName(files[0].name);
  fileSize.value = files[0].size;
  file.value = files[0];
}

function openFileSelect() {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = () => {
    if (input.files) selectFile(input.files);
  };
  input.click();
}
</script>
