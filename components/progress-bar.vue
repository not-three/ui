<template>
  <canvas ref="canvas" />
</template>

<script lang="ts" setup>
import type { FileUploadProgress, FileUploadState } from "@not3/sdk";
import { ref, watch, onMounted } from "vue";

const props = defineProps<{
  status: FileUploadProgress | number;
  total: number;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const colors = new Map<FileUploadState, string>([
  ["read", "#333"],
  ["crypto", "#666"],
  ["upload", "#aaa"],
  ["done", "#fff"],
  ["error", "#f00"],
]);

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

  const totalColumns = width;
  for (let col = 0; col < totalColumns; col++) {
    const id = Math.floor((col / totalColumns) * props.total);
    let color = "rgba(0,0,0,0)";

    if (typeof props.status === "number") {
      if (id < props.status) color = "#fff";
    } else {
      const status = props.status[id];
      if (status) {
        color = colors.get(status.state) || "#000";
      }
    }

    ctx.fillStyle = color;
    ctx.fillRect(col, 0, 1, height);
  }
};

watch(() => props.status, draw, { deep: true });
watch(() => props.total, draw);
onMounted(draw);
</script>
