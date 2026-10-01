<template>
  <transition-fade>
    <misc-overlay-container v-if="store.p2pSend" class="z-30" :file-drop="phase === 'pick'" @file-drop="selectFiles">
      <div class="bg-black border-2 border-white/20 p-5 w-[90vw] max-w-lg text-white space-y-4">
        <h2 class="text-xl font-bold">P2P file transfer</h2>
        <template v-if="phase === 'pick'">
          <p>Choose or drop one file. Keep this tab open while sharing it.</p>
          <p v-if="file">{{ file.name }} ({{ formatBytes(file.size) }})</p>
          <div class="flex gap-2">
            <button class="border border-white px-3 py-1" @click="openFileSelect">Choose file</button>
            <button :disabled="!file" class="border border-white px-3 py-1 disabled:opacity-50" @click="startSend">Start</button>
            <button class="border border-white px-3 py-1" @click="close">Close</button>
          </div>
        </template>
        <template v-if="phase === 'connecting' || phase === 'waiting' || phase === 'transferring'">
          <p v-if="phase === 'connecting'">Creating transfer session…</p>
          <template v-else>
            <p class="break-all select-all">{{ link }}</p>
            <button class="border border-white px-3 py-1" @click="copyLink">Copy link</button>
            <canvas ref="qrCanvas" class="bg-white p-2 max-w-full" aria-label="Transfer QR code" />
            <p v-if="phase === 'waiting'">Waiting for the receiver — keep this tab open.</p>
            <template v-else>
              <progress-bar :status="bytesSent" :total="file?.size || 0" class="w-full h-4" />
              <p>{{ formatBytes(bytesSent) }} / {{ formatBytes(file?.size || 0) }}</p>
            </template>
          </template>
          <button class="border border-white px-3 py-1" @click="cancel">Cancel</button>
        </template>
        <template v-if="phase === 'done' || phase === 'error'">
          <p>{{ phase === 'done' ? 'Transfer complete.' : 'Transfer stopped.' }}</p>
          <button class="border border-white px-3 py-1" @click="close">Close</button>
        </template>
      </div>
    </misc-overlay-container>
  </transition-fade>
</template>

<script setup lang="ts">
import { FragmentData, P2PSender, P2PCancelledError } from '@not3/sdk';
import QRCode from 'qrcode';
import { OkDialog } from '~/lib/dialog';
import { describeTransferError } from '~/lib/transfer/errors';
import { p2pApiFor } from '~/lib/transfer/p2p';

const store = useAppStore();
const notifications = useNotificationStore();
const phase = ref<'pick' | 'connecting' | 'waiting' | 'transferring' | 'done' | 'error'>('pick');
const file = ref<File | null>(null);
const bytesSent = ref(0);
const link = ref('');
const qrCanvas = ref<HTMLCanvasElement | null>(null);
let sender: P2PSender | null = null;
let cancelled = false;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

function selectFiles(files: FileList) {
  if (phase.value !== 'pick') return;
  if (files.length !== 1) return notifications.show('Select exactly one file.');
  file.value = files[0] || null;
}

function openFileSelect() {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = () => { if (input.files) selectFiles(input.files); };
  input.click();
}

function close() {
  if (phase.value !== 'pick' && phase.value !== 'done' && phase.value !== 'error') return;
  store.p2pSend = false;
  phase.value = 'pick';
  file.value = null;
  link.value = '';
  sender = null;
}

async function cancel() {
  cancelled = true;
  await sender?.cancel();
  phase.value = 'error';
  close();
}

async function showLink() {
  if (!sender || link.value) return;
  const base = store.api.getOptions().baseUrl;
  const fragment = new FragmentData({
    seed: sender.getSeed(),
    p2p: true,
    cryptoMode: 'gcm',
    server: base === store.config.baseURL ? undefined : base,
  });
  link.value = `${window.location.origin}/f/${sender.getSessionId()}#${fragment.toString()}`;
  await nextTick();
  if (qrCanvas.value) await QRCode.toCanvas(qrCanvas.value, link.value, { margin: 1 });
}

async function startSend() {
  if (!file.value || phase.value !== 'pick' || !store.info.p2pEnabled) return;
  cancelled = false;
  phase.value = 'connecting';
  const selected = file.value;
  try {
    const api = p2pApiFor(null, store.api.getOptions().baseUrl, window.location.origin, store.api.getOptions().password);
    sender = new P2PSender(api.p2p(), selected.name.replaceAll(/[^a-zA-Z0-9-.]/g, '_'), selected.size);
    sender.onProgress((p) => {
      bytesSent.value = p.bytesTransferred;
      if (p.state === 'waiting-peer') {
        if (phase.value === 'transferring') notifications.show('Receiver disconnected — waiting for them to reopen the link.');
        phase.value = 'waiting';
        void showLink();
      } else if (p.state === 'transfer') phase.value = 'transferring';
    });
    await sender.start((start, end) => selected.slice(start, end).arrayBuffer());
    if (!cancelled) phase.value = 'done';
  } catch (error) {
    if (cancelled || error instanceof P2PCancelledError) return;
    phase.value = 'error';
    store.dialog = new OkDialog('Transfer failed', describeTransferError(error, 'The transfer could not be completed.'));
  }
}

function copyLink() {
  if (link.value) void navigator.clipboard.writeText(link.value);
}

function beforeUnload(event: BeforeUnloadEvent) {
  if (phase.value === 'waiting' || phase.value === 'transferring') event.preventDefault();
}

onMounted(() => window.addEventListener('beforeunload', beforeUnload));
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload);
  void sender?.cancel();
});
</script>
