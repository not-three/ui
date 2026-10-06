<template>
  <div class="flex flex-col gap-2 text-xs">
    <div class="flex items-center gap-2">
      <span>{{ width }} × {{ height }} px</span>
      <div class="flex-grow" />
      <button type="button" class="panel-btn" @click="zoom = zoom === 'fit' ? 'actual' : 'fit'">{{ zoom === 'fit' ? '100 %' : 'Fit' }}</button>
    </div>
    <div data-stage class="overflow-auto border border-white/30 min-h-24 flex items-center justify-center" :class="checkerboard ? 'image-checkerboard' : 'bg-[#111]'" @dragover.prevent @drop.prevent.stop="onDrop" @paste.stop="onPaste">
      <div ref="frame" class="relative inline-block touch-none select-none" :class="zoom === 'fit' ? 'max-w-full' : ''" tabindex="0" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerUp" @keydown="onKeydown">
        <img v-if="url" :src="url" alt="Image preview" draggable="false" class="block object-contain" :class="zoom === 'fit' ? 'max-w-full max-h-[360px]' : ''" @load="readPointColor">
        <div v-if="rectangle" class="absolute border border-white bg-black/20 cursor-move" :style="rectStyle">
          <button v-for="handle in handles" :key="handle" type="button" :data-handle="handle" :aria-label="`${mode} ${handle} handle`" class="absolute w-2.5 h-2.5 bg-black border border-white" :style="handleStyle(handle)" @pointerdown.stop="pointerDown($event, handle)" />
        </div>
        <div v-if="mode === 'point' && point" class="absolute pointer-events-none text-white drop-shadow" :style="{ left: `${point.x / width * 100}%`, top: `${point.y / height * 100}%`, transform: 'translate(-50%, -50%)' }">✚</div>
      </div>
    </div>
    <div v-if="rectangle" class="flex gap-1 flex-wrap">
      <label v-for="key in rectKeys" :key="key" class="flex items-center gap-1">{{ key }}
        <input type="number" class="panel-input w-20" :aria-label="`${mode === 'crop' ? 'Crop' : 'Region'} ${key}`" :min="key === 'x' || key === 'y' ? 0 : 1" :max="key === 'x' || key === 'width' ? width : height" :value="rectangle[key]" @input="changeNumber(key, $event)">
      </label>
    </div>
    <div v-if="mode === 'point' && point">x {{ point.x }}, y {{ point.y }} <span v-if="pointColor">{{ pointColor }}</span></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { ImagePoint, ImageRegion } from '~/lib/tools/types';
const props = defineProps<{ blob?: Blob; bitmap?: ImageBitmap; mode: 'view' | 'crop' | 'region' | 'point'; aspect?: number; value?: ImageRegion | ImagePoint; checkerboard: boolean; width: number; height: number }>();
const emit = defineEmits<{ 'update:value': [value: ImageRegion | ImagePoint]; file: [file: File]; paste: [text: string] }>();
const zoom = ref<'fit' | 'actual'>('fit');
const frame = ref<HTMLElement>();
const url = ref('');
const pointColor = ref('');
const rectKeys = ['x', 'y', 'width', 'height'] as const;
const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const rectangle = computed(() => props.mode === 'crop' || props.mode === 'region' ? props.value as ImageRegion | undefined : undefined);
const point = computed(() => props.mode === 'point' ? props.value as ImagePoint | undefined : undefined);
const rectStyle = computed(() => rectangle.value ? { left: `${rectangle.value.x / props.width * 100}%`, top: `${rectangle.value.y / props.height * 100}%`, width: `${rectangle.value.width / props.width * 100}%`, height: `${rectangle.value.height / props.height * 100}%` } : {});
function handleStyle(handle: string) { return { left: handle.includes('w') ? '0%' : handle.includes('e') ? '100%' : '50%', top: handle.includes('n') ? '0%' : handle.includes('s') ? '100%' : '50%', transform: 'translate(-50%, -50%)', cursor: `${handle}-resize` }; }
let dragging: { start: ImagePoint; base?: ImageRegion; handle: string } | null = null;
let token = 0;
watch(() => [props.blob, props.bitmap], async () => {
  const own = ++token;
  if (url.value) URL.revokeObjectURL(url.value);
  url.value = '';
  if (props.blob) url.value = URL.createObjectURL(props.blob);
  else if (props.bitmap) {
    const bitmap = props.bitmap;
    const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
    if (blob && own === token) url.value = URL.createObjectURL(blob);
  }
}, { immediate: true });
onBeforeUnmount(() => { token++; if (url.value) URL.revokeObjectURL(url.value); });
function local(event: PointerEvent): ImagePoint {
  const rect = frame.value!.getBoundingClientRect();
  return { x: Math.min(props.width - 1, Math.max(0, Math.round((event.clientX - rect.left) * props.width / rect.width))), y: Math.min(props.height - 1, Math.max(0, Math.round((event.clientY - rect.top) * props.height / rect.height))) };
}
function clampRect(value: ImageRegion): ImageRegion {
  const x = Math.max(0, Math.min(props.width - 1, Math.round(value.x)));
  const y = Math.max(0, Math.min(props.height - 1, Math.round(value.y)));
  let width = Math.max(1, Math.min(props.width - x, Math.round(value.width)));
  let height = Math.max(1, Math.min(props.height - y, Math.round(value.height)));
  if (props.aspect && props.mode === 'crop') {
    height = Math.max(1, Math.min(props.height - y, Math.round(width / props.aspect)));
    width = Math.max(1, Math.min(props.width - x, Math.round(height * props.aspect)));
  }
  return { x, y, width, height };
}
function pointerDown(event: PointerEvent, handle?: string) {
  if (props.mode === 'view') return;
  const start = local(event);
  if (props.mode === 'point') { emit('update:value', start); return; }
  const base = rectangle.value;
  const inside = base && start.x >= base.x && start.x <= base.x + base.width && start.y >= base.y && start.y <= base.y + base.height;
  dragging = { start, base, handle: handle ?? (inside ? 'move' : 'draw') };
  frame.value?.setPointerCapture(event.pointerId);
  if (!inside && !handle) emit('update:value', { x: start.x, y: start.y, width: 1, height: 1 });
}
function pointerMove(event: PointerEvent) {
  if (!dragging) return;
  const current = local(event);
  const { start, base, handle } = dragging;
  if (handle === 'draw') { emit('update:value', clampRect({ x: Math.min(start.x, current.x), y: Math.min(start.y, current.y), width: Math.abs(current.x - start.x) + 1, height: Math.abs(current.y - start.y) + 1 })); return; }
  if (!base) return;
  const dx = current.x - start.x; const dy = current.y - start.y;
  if (handle === 'move') { emit('update:value', clampRect({ ...base, x: Math.max(0, Math.min(props.width - base.width, base.x + dx)), y: Math.max(0, Math.min(props.height - base.height, base.y + dy)) })); return; }
  const left = handle.includes('w') ? base.x + dx : base.x;
  const top = handle.includes('n') ? base.y + dy : base.y;
  const right = handle.includes('e') ? base.x + base.width + dx : base.x + base.width;
  const bottom = handle.includes('s') ? base.y + base.height + dy : base.y + base.height;
  const value = { x: Math.min(left, right - 1), y: Math.min(top, bottom - 1), width: Math.abs(right - left), height: Math.abs(bottom - top) };
  if (props.aspect && props.mode === 'crop' && (handle === 'n' || handle === 's')) value.width = Math.round(value.height * props.aspect);
  emit('update:value', clampRect(value));
}
function pointerUp() { dragging = null; }
function changeNumber(key: typeof rectKeys[number], event: Event) {
  if (!rectangle.value) return;
  const number = Number((event.target as HTMLInputElement).value);
  const value = { ...rectangle.value, [key]: number };
  if (key === 'height' && props.aspect && props.mode === 'crop') value.width = Math.round(number * props.aspect);
  emit('update:value', clampRect(value));
}
function onKeydown(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  const delta = event.shiftKey ? 10 : 1;
  const dx = event.key === 'ArrowLeft' ? -delta : event.key === 'ArrowRight' ? delta : 0;
  const dy = event.key === 'ArrowUp' ? -delta : event.key === 'ArrowDown' ? delta : 0;
  if (point.value) emit('update:value', { x: Math.max(0, Math.min(props.width - 1, point.value.x + dx)), y: Math.max(0, Math.min(props.height - 1, point.value.y + dy)) });
  if (rectangle.value) emit('update:value', clampRect({ ...rectangle.value, x: rectangle.value.x + dx, y: rectangle.value.y + dy }));
}
function readPointColor() {
  if (!point.value || !url.value) return;
  const image = frame.value?.querySelector('img'); if (!image) return;
  const canvas = document.createElement('canvas'); canvas.width = props.width; canvas.height = props.height;
  const context = canvas.getContext('2d'); context?.drawImage(image, 0, 0);
  const color = context?.getImageData(point.value.x, point.value.y, 1, 1).data;
  if (color) pointColor.value = '#' + [...color].slice(0, 3).map(value => value.toString(16).padStart(2, '0')).join('');
}
watch(point, readPointColor);
function onDrop(event: DragEvent) { const file = event.dataTransfer?.files[0]; if (file) emit('file', file); else { const text = event.dataTransfer?.getData('text/plain'); if (text) emit('paste', text); } }
function onPaste(event: ClipboardEvent) { const file = event.clipboardData?.files[0]; if (file) { event.preventDefault(); emit('file', file); } else { const text = event.clipboardData?.getData('text/plain'); if (text) { event.preventDefault(); emit('paste', text); } } }
</script>

<style scoped>
.image-checkerboard { background-color: #111; background-image: linear-gradient(45deg,#1e1e1e 25%,transparent 25%),linear-gradient(-45deg,#1e1e1e 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1e1e1e 75%),linear-gradient(-45deg,transparent 75%,#1e1e1e 75%); background-size: 32px 32px; background-position: 0 0,0 16px,16px -16px,-16px 0; }
</style>
