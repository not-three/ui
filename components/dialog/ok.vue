<template>
  <div class="text-right">
    <button @click="onOk()">
      <span class="underline font-bold">O</span>
      <span>k</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { OkDialog } from '~/lib/dialog';
const emit = defineEmits(["close"]);
const props = defineProps<{
  data: OkDialog;
}>();

function onOk() {
  emit('close');
  props.data.onOk();
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Enter':
    case 'Escape':
    case 'o':
    case 'y':
      event.preventDefault();
      event.stopPropagation();
      onOk();
      break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
