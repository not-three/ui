<template>
  <transition-fade>
    <overlay-container v-if="visible" class="z-40">
      <icon
        name="ph:spinner-ball-fill"
        class="w-12 h-12 text-white animate-spin"
      />
    </overlay-container>
  </transition-fade>
</template>

<script lang="ts" setup>
defineProps<{
  visible?: boolean;
}>();
</script>
