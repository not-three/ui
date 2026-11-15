<template>
  <canvas ref="canvas" />
</template>

<script lang="ts" setup>
import type { FileUploadProgress, FileUploadState  } from "@not3/sdk";
import { activeTheme } from '~/lib/theme/registry';
import { progressColors } from '~/lib/theme/progress-colors';
import { CUSTOM_CSS_LOADED_EVENT } from '~/lib/theme/custom-css';
import { onBeforeUnmount } from 'vue';

const props = defineProps<{
  status: FileUploadProgress|number;
  total: number;
}>();

const PIXEL_SIZE = 16;
const canvas = ref<HTMLCanvasElement | null>(null);

const draw = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;
  const el = canvas.value;
  const width = el.clientWidth;
  const height = el.clientHeight;
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  const colors = progressColors();
  const widthInPixels = Math.floor(width / PIXEL_SIZE);
  const heightInPixels = Math.floor(height / PIXEL_SIZE);
  const totalPixels = widthInPixels * heightInPixels;
  for (let p = 0; p < totalPixels; p++) {
    const id = Math.floor((p / totalPixels) * props.total);
    let color = "rgba(0,0,0,0)";
    if (typeof props.status === "number") {
      if (id < props.status) color = colors.done;
    } else {
      const status = props.status[id];
      if (status) color = colors[status.state as FileUploadState] || colors.read;
    }
    ctx.fillStyle = color;
    const x = p % widthInPixels;
    const y = Math.floor(p / widthInPixels);
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
  }
};

watch(() => props.status, draw, { deep: true });
watch(() => props.total, draw);
watch(activeTheme, draw);
onMounted(() => {
  draw();
  window.addEventListener(CUSTOM_CSS_LOADED_EVENT, draw);
});
onBeforeUnmount(() => window.removeEventListener(CUSTOM_CSS_LOADED_EVENT, draw));
</script>
