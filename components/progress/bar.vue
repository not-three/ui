<template>
  <canvas ref="canvas" />
</template>

<script lang="ts" setup>
import type { FileUploadProgress, FileUploadState } from "@not3/sdk";
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { activeTheme } from '~/lib/theme/registry';
import { progressColors } from '~/lib/theme/progress-colors';
import { CUSTOM_CSS_LOADED_EVENT } from '~/lib/theme/custom-css';

const props = defineProps<{
  status: FileUploadProgress | number;
  total: number;
}>();

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

  const totalColumns = width;
  for (let col = 0; col < totalColumns; col++) {
    const id = Math.floor((col / totalColumns) * props.total);
    let color = "rgba(0,0,0,0)";

    if (typeof props.status === "number") {
      if (id < props.status) color = colors.done;
    } else {
      const status = props.status[id];
      if (status) {
        color = colors[status.state as FileUploadState] || colors.read;
      }
    }

    ctx.fillStyle = color;
    ctx.fillRect(col, 0, 1, height);
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
