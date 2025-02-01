<template>
  <div class="border-l-2 border-white/20 h-full content-[''] print:hidden" />
  <div ref="container" class="relative print:hidden">
    <h2
      class="select-none underline-offset-2"
      :class="{
        'brightness-50 cursor-not-allowed': config.disabled,
        'hover:underline cursor-pointer': !config.disabled,
      }"
      @click="active = config.disabled ? false : !active"
    >
      {{ config.name }}
    </h2>
    <div
      class="absolute inset-x-0 bottom-0 flex justify-start items-center pointer-events-none"
    >
      <transition-fade>
        <div
          v-if="active"
          class="translate-y-full overflow-visible z-10 flex flex-col items-start pointer-events-auto"
        >
          <div
            class="w-0 h-0 border-x-[1rem] border-x-transparent border-b-[1rem] border-b-black mt-2"
          />
          <div class="bg-black p-2">
            <button
              v-for="entry in config.entries"
              :key="entry.name"
              :disabled="entry.disabled"
              class="w-full text-left whitespace-nowrap bg-white/5 my-1 px-2 py-1 transition-colors"
              :class="entry.disabled ? 'cursor-not-allowed line-through' : 'hover:bg-white/10'"
              :title="entry.title ? entry.title : entry.disabled ? 'This action is disabled by config or the server.' : ''"
              @click="execFunction(entry.onClick)"
            >
              <span>{{ entry.name }}</span>
            </button>
          </div>
        </div>
      </transition-fade>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { NavigationEntry } from '~/lib/navigation';

const container = ref() as Ref<HTMLDivElement>;
const active = ref(false);
defineProps<{config: NavigationEntry}>();

function outsideClickListener(event: MouseEvent | TouchEvent) {
  if (!container.value.contains(event.target as Node)) active.value = false;
}

function execFunction(fn: () => void) {
  active.value = false;
  fn();
}

onMounted(() => {
  window.addEventListener("click", outsideClickListener);
  window.addEventListener("touchstart", outsideClickListener);
});

onUnmounted(() => {
  window.removeEventListener("click", outsideClickListener);
  window.removeEventListener("touchstart", outsideClickListener);
});
</script>
