<template>
  <input
    ref="input"
    v-model="value"
    type="text"
    class="w-full"
    @keydown.enter="onOk"
  >
  <div class="flex justify-end gap-4 mt-2">
    <button @click="onOk()">Submit</button>
    <button @click="onCancel()">Cancel</button>
  </div>
</template>

<script lang="ts" setup>
import type { TextInputDialog } from '~/lib/dialog';
const emit = defineEmits(["close"]);
const props = defineProps<{
  data: TextInputDialog;
}>();
const value = ref(props.data.value);
const input = ref() as Ref<HTMLInputElement>;

function onOk() {
  emit('close');
  props.data.onOk(value.value);
}

function onCancel() {
  emit('close');
  props.data.onCancel();
}

watch(
  () => props.data.value,
  (newValue) => {
    value.value = newValue;
  },
);

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Escape':
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  input.value.focus();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
