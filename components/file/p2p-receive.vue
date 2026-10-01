<template>
  <misc-overlay-container class="z-30">
    <div class="bg-black border-2 border-white/20 p-5 w-[90vw] max-w-md text-white space-y-4">
      <h2 class="text-xl font-bold">Receive P2P file</h2>
      <p v-if="meta" class="break-all">{{ meta.name }} ({{ formatBytes(meta.size) }})</p>
      <template v-if="phase === 'consent'">
        <p>Someone wants to send you a file. Connect to see its name and size?</p>
        <div class="flex gap-2">
          <button class="border border-white px-3 py-1" @click="connect">Connect</button>
          <button class="border border-white px-3 py-1" @click="decline">Decline</button>
        </div>
      </template>
      <template v-if="phase === 'connecting'">
        <p>Connecting to sender…</p>
        <button class="border border-white px-3 py-1" @click="decline">Cancel</button>
      </template>
      <template v-if="phase === 'transferring' || phase === 'saving'">
        <progress-bar :status="progress.status" :total="progress.total" class="w-full h-4" />
        <p>{{ formatBytes(bytesReceived) }} / {{ formatBytes(meta?.size || 0) }}</p>
        <p>Keep this tab open until the file is saved.</p>
        <button class="border border-white px-3 py-1" @click="decline">Cancel</button>
      </template>
      <template v-if="phase === 'done'">
        <p>{{ sink?.needsSave ? 'File received. Save it to your device.' : 'Transfer complete.' }}</p>
        <button v-if="sink?.needsSave" class="border border-white px-3 py-1" @click="sink.save()">Save file</button>
        <button class="border border-white px-3 py-1" @click="goHome">Home</button>
      </template>
    </div>
  </misc-overlay-container>
</template>

<script setup lang="ts">
import { FragmentData, P2PReceiver, P2PPeerAuthFailedError, P2PPeerDisconnectedError, P2PCancelledError, type P2PMeta } from '@not3/sdk';
import { OkDialog, YesNoDialog } from '~/lib/dialog';
import { describeTransferError } from '~/lib/transfer/errors';
import { chunkTotals, p2pApiFor } from '~/lib/transfer/p2p';
import { prepareP2PSink, type P2PSink, type PreparedP2PSink } from '~/lib/transfer/p2p-sink';

const props = defineProps<{ file: string }>();
const store = useAppStore();
const router = useRouter();
const phase = ref<'consent' | 'connecting' | 'transferring' | 'saving' | 'done' | 'error'>('consent');
const meta = ref<P2PMeta | null>(null);
const progress = ref({ status: 0, total: 0 });
const bytesReceived = ref(0);
let receiver: P2PReceiver | null = null;
let sink: P2PSink | null = null;
let prepared: PreparedP2PSink | null = null;
let cancelled = false;
let activeRun = 0;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

function beforeUnload(event: BeforeUnloadEvent) {
  if (phase.value === 'connecting' || phase.value === 'transferring' || phase.value === 'saving') event.preventDefault();
}

function goHome() { void router.push('/'); }

async function connect() {
  if (phase.value !== 'consent') return;
  phase.value = 'connecting';
  try {
    FragmentData.fromURL(window.location.href);
    const destination = await prepareP2PSink('incoming-file');
    if (cancelled) return void destination.abort();
    prepared = destination;
    startReceive();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      phase.value = 'consent';
      return;
    }
    handleError(error);
  }
}

async function decline() {
  cancelled = true;
  activeRun++;
  await receiver?.cancel();
  await prepared?.abort();
  goHome();
}

function handleError(error: unknown) {
  if (cancelled) return;
  phase.value = 'error';
  if (error instanceof P2PPeerDisconnectedError) {
    store.dialog = new YesNoDialog(
      'Connection ended',
      'The sender disconnected or cancelled. Retry only if they are still sharing the file.',
      () => { void startReceive(); },
      goHome,
    );
  } else {
    const message = error instanceof P2PPeerAuthFailedError
      ? "This link's key does not match the transfer."
      : describeTransferError(error, 'The transfer could not be completed.');
    store.dialog = new OkDialog('Transfer failed', message, goHome);
  }
}

function startReceive() {
  const run = ++activeRun;
  phase.value = 'connecting';
  let resolveSink!: (value: P2PSink) => void;
  const sinkReady = new Promise<P2PSink>((resolve) => { resolveSink = resolve; });
  try {
    const fragment = FragmentData.fromURL(window.location.href);
    const api = p2pApiFor(fragment.server, store.api.getOptions().baseUrl, window.location.origin, store.api.getOptions().password);
    receiver = new P2PReceiver(api.p2p(), props.file, fragment.seed);
    receiver.onProgress((p) => {
      if (run !== activeRun) return;
      bytesReceived.value = p.bytesTransferred;
      if (meta.value) progress.value = chunkTotals(meta.value.size, meta.value.chunkPayloadSize, p.bytesTransferred);
    });
    // Destination is already open before start(): the SDK accepts immediately
    // on metadata, so its first chunk can be written without a consent queue.
    void receiver.start(async (buf, index) => {
      const destination = await sinkReady;
      if (run !== activeRun) throw new P2PCancelledError();
      await destination.write(buf, index);
    }, sink?.bytesWritten || 0).then(async () => {
      const destination = await sinkReady;
      if (run !== activeRun) return;
      phase.value = 'saving';
      await destination.finish();
      phase.value = 'done';
    }).catch((error: unknown) => { if (run === activeRun) handleError(error); });
    void receiver.getMeta().then((data) => {
      if (run !== activeRun) return;
      try {
        if (!sink) sink = prepared!.attach(data.name, data.size, data.chunkPayloadSize);
        else if (meta.value && (meta.value.size !== data.size || meta.value.chunkPayloadSize !== data.chunkPayloadSize))
          throw new Error('Sender changed file metadata during retry');
        meta.value = data;
        progress.value = chunkTotals(data.size, data.chunkPayloadSize, sink.bytesWritten);
        phase.value = 'transferring';
        resolveSink(sink);
      } catch (error) {
        activeRun++;
        void receiver?.cancel();
        handleError(error);
      }
    }).catch(() => {});
  } catch (error) { handleError(error); }
}

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload);
});
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload);
  cancelled = true;
  activeRun++;
  void receiver?.cancel();
  if (phase.value !== 'done') void prepared?.abort();
});
</script>
