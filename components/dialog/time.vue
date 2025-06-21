<template>
  <p class="text-center">{{ timeStr }}</p>
  <input v-model="sliderVal" type="range" min="1" max="1000" class="w-full">
  <div class="flex justify-end gap-4 mt-4">
    <button @click="onOk()">
      <span class="underline font-bold">O</span>
      <span>k</span>
    </button>
    <button @click="onCancel()">
      <span class="underline font-bold">C</span>
      <span>ancel</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { TimeDialog } from '~/lib/dialog'

const emit = defineEmits(['close'])
const props = defineProps<{ data: TimeDialog }>()

const sliderMax = 1000

function sliderToTime(val: number): number {
  const p = val / sliderMax
  const maxTime = props.data.max
  if (maxTime <= 3600) return p * maxTime
  if (maxTime <= 86400)
    return p < 0.2
      ? (p / 0.2) * 3600
      : 3600 + ((p - 0.2) / 0.8) * (maxTime - 3600)
  if (maxTime <= 604800)
    return p < 0.2
      ? (p / 0.2) * 3600
      : p < 0.5
      ? 3600 + ((p - 0.2) / 0.3) * (86400 - 3600)
      : 86400 + ((p - 0.5) / 0.5) * (maxTime - 86400)
  return p < 0.2
    ? (p / 0.2) * 3600
    : p < 0.5
    ? 3600 + ((p - 0.2) / 0.3) * (86400 - 3600)
    : p < 0.8
    ? 86400 + ((p - 0.5) / 0.3) * (604800 - 86400)
    : 604800 + ((p - 0.8) / 0.2) * (maxTime - 604800)
}

function timeToSlider(time: number): number {
  const maxTime = props.data.max
  let p = 0
  if (maxTime <= 3600) p = time / maxTime
  else if (maxTime <= 86400)
    p = time <= 3600
      ? (time / 3600) * 0.2
      : 0.2 + 0.8 * ((time - 3600) / (maxTime - 3600))
  else if (maxTime <= 604800)
    p = time <= 3600
      ? (time / 3600) * 0.2
      : time <= 86400
      ? 0.2 + 0.3 * ((time - 3600) / (86400 - 3600))
      : 0.5 + 0.5 * ((time - 86400) / (maxTime - 86400))
  else
    p = time <= 3600
      ? (time / 3600) * 0.2
      : time <= 86400
      ? 0.2 + 0.3 * ((time - 3600) / (86400 - 3600))
      : time <= 604800
      ? 0.5 + 0.3 * ((time - 86400) / (604800 - 86400))
      : 0.8 + 0.2 * ((time - 604800) / (maxTime - 604800))
  return p * sliderMax
}

function formatTime(s: number): string {
  const sec = Math.round(s)
  const days = Math.floor(sec / 86400)
  const hours = Math.floor((sec % 86400) / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = sec % 60
  const parts = []
  if (days > 0) parts.push(days + ' d')
  if (hours > 0) parts.push(hours + ' h')
  if (minutes > 0) parts.push(minutes + ' m')
  if (parts.length === 0) parts.push(seconds + ' s')
  return parts.join(' ')
}

const sliderVal = ref(timeToSlider(props.data.time))
const currentTime = computed(() => sliderToTime(sliderVal.value))
const timeStr = computed(() => formatTime(currentTime.value))

function onOk() {
  emit('close')
  props.data.onOk(currentTime.value)
}

function onCancel() {
  emit('close')
  props.data.onCancel()
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Enter':
    case 'y':
    case 'o':
      event.preventDefault()
      event.stopPropagation()
      onOk()
      break
    case 'Backspace':
    case 'Escape':
    case 'n':
      event.preventDefault()
      event.stopPropagation()
      onCancel()
      break
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>
