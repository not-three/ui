<template>
  <transition-fade>
    <misc-overlay-container v-if="coworkShareOpen && activeCowork" class="z-40">
      <div class="bg-black border-2 border-white/20 p-5 w-[90vw] max-w-lg text-white space-y-4">
        <h2 class="text-xl font-bold">Share cowork session</h2>
        <p>Anyone with this link can edit while the session is open.</p>
        <p class="break-all select-all" data-testid="cowork-link">{{ link }}</p>
        <canvas ref="qrCanvas" class="bg-white p-2 max-w-full" aria-label="Cowork QR code" />
        <div class="flex gap-2">
          <button class="border border-white px-3 py-1" @click="copyLink">Copy link</button>
          <button class="border border-white px-3 py-1" @click="coworkShareOpen = false">Close</button>
        </div>
      </div>
    </misc-overlay-container>
  </transition-fade>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { activeCowork, coworkShareOpen } from '~/lib/cowork/active'

const store = useAppStore()
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const link = computed(() => {
  if (!activeCowork.value?.session.roomId) return ''
  const base = new URL(useRuntimeConfig().public.uiBaseURL || '/', window.location.origin).toString()
  const server = store.api.getOptions().baseUrl !== store.config.baseURL ? store.api.getOptions().baseUrl : undefined
  return activeCowork.value.session.shareUrl(base, server)
})
watch([link, coworkShareOpen], async () => {
  if (!coworkShareOpen.value || !link.value) return
  await nextTick()
  if (qrCanvas.value) await QRCode.toCanvas(qrCanvas.value, link.value, { margin: 1 })
})
function copyLink() { if (link.value) void navigator.clipboard.writeText(link.value) }
</script>
