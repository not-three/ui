<template>
  <div
    class="overlay-container"
    @drop="onDrop"
    @dragover="onDragOver"
    @dragenter="onDragEnter"
    @dragleave="dragging = false"
  >
    <transition-fade>
      <div
        v-if="dragging && fileDrop"
        class="overlay-container-file-drop"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragenter="onDragEnter"
      >
        <icon name="lucide:upload" class="text-white text-8xl" />
      </div>
    </transition-fade>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const dragging = ref(false);
const props = defineProps<{ fileDrop?: boolean }>();
const emit = defineEmits<{
  (e: "fileDrop", files: FileList): void;
}>();
let timeout: number|null = null;

function onDragEnter(event: DragEvent) {
  if (!props.fileDrop) return;
  event.preventDefault();
  dragging.value = true;
  if (timeout) window.clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    dragging.value = false;
    timeout = null;
  }, 5_000);
}

function onDragOver(event: DragEvent) {
  if (!props.fileDrop) return;
  event.preventDefault();
}

function onDrop(event: DragEvent) {
  if (!props.fileDrop) return;
  event.preventDefault();
  if (!event.dataTransfer) return;
  emit("fileDrop", event.dataTransfer.files);
  dragging.value = false;
  if (timeout) window.clearTimeout(timeout);
  timeout = null;
}
</script>


<style>
.overlay-container {
  @apply fixed inset-0 flex flex-col justify-center items-center;
  @apply cursor-progress bg-black/70;
  @apply cursor-default;
}

.overlay-container-file-drop {
  @apply absolute inset-0 flex justify-center items-center z-40;
  @apply bg-black/30 backdrop-blur-xl pointer-events-none;
}
</style>
