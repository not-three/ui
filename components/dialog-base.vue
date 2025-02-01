<template>
  <transition-fade>
    <overlay-container v-if="store.dialog" class="z-50">
      <transition-fade>
        <div :key="store.dialog.type" class="dialog-content">
          <h1 v-if="store.dialog.title" class="text-2xl whitespace-pre-wrap">{{ store.dialog.title }}</h1>
          <p v-if="store.dialog.text" class="my-2 whitespace-pre-wrap">{{ store.dialog.text }}</p>
          <dialog-ok v-if="store.dialog.type === DialogType.Ok" :data="store.dialog" @close="close" />
          <dialog-text-input v-if="store.dialog.type === DialogType.TextInput" :data="store.dialog" @close="close" />
          <dialog-text-output v-if="store.dialog.type === DialogType.TextOutput" :data="store.dialog" @close="close" />
          <dialog-yes-no v-if="store.dialog.type === DialogType.YesNo" :data="store.dialog" @close="close" />
          <dialog-time v-if="store.dialog.type === DialogType.Time" :data="store.dialog" @close="close" />
        </div>
      </transition-fade>
    </overlay-container>
  </transition-fade>
</template>

<script lang="ts" setup>
import { DialogType } from '~/lib/dialog';
const store = useAppStore();
const close = () => store.dialog = null;
</script>

<style>
.dialog-content {
  @apply bg-black border-white/20 border-2 p-4 min-w-[20vw] max-w-md;
}
.dialog-content button {
  @apply border-white border-2 px-2 py-1;
}
.dialog-content input {
  @apply bg-black border-white border-2 p-1;
  @apply focus:outline-none;
}
</style>
