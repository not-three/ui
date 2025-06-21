<template>
  <div class="w-screen flex gap-2 bg-black text-white px-4 py-1 items-center">
    <img
      id="logo"
      src="/assets/img/icon.svg"
      class="h-5 w-5 border-white border"
      alt="!3"
    >
    <h1 class="navigation-logo-text">not-th.re</h1>
    <navigation-entry v-for="entry in entries" :key="entry.name" :config="entry" />
    <div class="flex-grow" />
    <navigation-language v-if="!store.excalidraw" />
    <button v-if="store.excalidraw" class="border border-white px-2 py-0.5 -my-1 hidden sm:block" @click="store.excalidraw = false">
      Close Excalidraw
    </button>
    <navigation-expires />
  </div>
  <div v-if="store.settings" class="w-full px-2 py-1 bg-yellow-600 select-none">
    <p class="font-bold text-center animate-pulse">
      <icon name="lucide:wrench" class="mb-1 mr-2" />
      SETTINGS EDITOR
      <icon name="lucide:wrench" class="mb-1 ml-2" />
    </p>
  </div>
</template>

<script lang="ts" setup>
import { YesNoDialog } from '~/lib/dialog';
import type { NavigationEntry } from '~/lib/navigation';
import * as Actions from '~/lib/actions';
const store = useAppStore();
const settings = useSettingsStore();

const entries = computed<NavigationEntry[]>(() => [
  {
    name: "File",
    entries: [
      {
        name: "Save",
        onClick: Actions.SAVE,
      },
      {
        name: "Save for custom time",
        onClick: Actions.SAVE_FOR_CUSTOM_TIME,
        disabled: store.settings,
        title: store.settings ? "Cant save settings for custom time" : undefined,
      },
      {
        name: "Save until read",
        onClick: Actions.SAVE_UNTIL_READ,
        disabled: store.settings,
        title: store.settings ? "Cant save settings until read" : undefined,
      },
      {
        name: "Download",
        onClick: Actions.DOWNLOAD,
      },
      {
        name: "Duplicate",
        onClick: Actions.DUPLICATE,
      },
      {
        name: "New",
        onClick: Actions.NEW,
      },
    ],
  },
  {
    name: "Share",
    entries: [
      {
        name: "Copy Link",
        onClick: Actions.SHARE_LINK
      },
      {
        name: "Copy cURL Command",
        onClick: Actions.SHARE_CURL,
      }
    ],
    disabled: store.settings,
  },
  {
    name: "Tools",
    entries: [
      {
        name: "Edit Settings",
        onClick: Actions.OPEN_SETTINGS,
        disabled: store.settings,
        title: store.settings ? "Settings editor is already open" : undefined,
      },
      {
        name: "Reset Settings",
        onClick: () => store.dialog = new YesNoDialog(
          "Reset Settings",
          "Are you sure you want to reset all settings?",
          () => {
            settings.$reset();
            window.location.reload();
          }
        ),
      },
      {
        name: "File Transfer",
        onClick: Actions.OPEN_FILE_TRANSFER,
        disabled: !store.info.fileTransferEnabled || store.settings,
        title: !store.info.fileTransferEnabled
          ? "File transfer is not enabled on this server"
          : store.settings
            ? "Cant open file transfer while settings editor is open"
            : undefined,
      },
      {
        name: (store.excalidraw ? "Close" : "Open") + " Excalidraw",
        onClick: Actions.OPEN_EXCALIDRAW,
        disabled: !store.config.drawURL || store.settings,
        title: !store.config.drawURL
          ? "Excalidraw URL is not configured"
          : store.settings
            ? "Cant open Excalidraw while settings editor is open"
            : undefined,
      }
    ],
  },
  {
    name: "About",
    entries: [
      {
        name: "Github Repository",
        onClick: () => window.open("https://github.com/not-three/main", "_blank"),
      },
      {
        name: "Help (Github Issues)",
        onClick: () => window.open("https://github.com/not-three/main/issues", "_blank"),
      },
      {
        name: "Privacy and Terms",
        onClick: () => window.open(store.config.termsURL, "_blank"),
        disabled: !store.config.termsURL,
        title: !store.config.termsURL ? "Terms URL is not configured" : undefined,
      },
    ],
  }
]);
</script>

<style>
.navigation-logo-text {
  @apply font-bold select-none transition-all duration-200;
  @apply max-w-0 -mr-1 overflow-hidden whitespace-pre;
  @apply print:max-w-32 print:mr-0
}
#logo:hover + h1 {
  @apply max-w-32 mr-0;
}
</style>
