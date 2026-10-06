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
    <button
      v-if="canStartCowork(store)"
      class="border border-white px-2 py-0.5 -my-1 hidden sm:block"
      @click="Actions.START_COWORK()"
    >Start cowork</button>
    <template v-if="activeCowork">
      <button class="border border-white px-2 py-0.5 -my-1" @click="activeCowork.session.saveAsNote()">Save as note</button>
      <button class="flex gap-1 items-center" aria-label="Cowork participants" @click="membersOpen = !membersOpen">
        <span v-for="peer in activeCowork.session.state.participants" :key="peer.peerId" :title="peer.name" class="w-6 h-6 rounded-full text-xs flex items-center justify-center text-black" :style="{ backgroundColor: peer.color, opacity: peer.connected ? 1 : 0.5 }">{{ peer.name.slice(0, 1).toUpperCase() }}</span>
      </button>
      <button class="border border-white px-2 py-0.5 -my-1" @click="coworkShareOpen = true">Share</button>
    </template>
    <button
      v-if="!store.excalidraw && !store.settings && runnable"
      class="border border-white px-2 py-0.5 -my-1 hidden sm:flex items-center gap-1"
      :title="store.sandbox ? 'Close the run/preview panel' : 'Run / preview this note'"
      @click="Actions.OPEN_SANDBOX()"
    >
      <icon :name="store.sandbox ? 'lucide:square' : 'lucide:play'" class="mb-0.5" />
      {{ store.sandbox ? "Stop" : "Run" }}
    </button>
    <button
      v-if="formatAvailable"
      class="border border-white px-2 py-0.5 -my-1 hidden sm:flex items-center gap-1"
      title="Format this note"
      @click="Actions.FORMAT()"
    >
      <icon name="lucide:align-left" class="mb-0.5" />
      Format
    </button>
    <navigation-language v-if="!store.excalidraw" />
    <button v-if="store.excalidraw && !activeCowork" class="border border-white px-2 py-0.5 -my-1 hidden sm:block" @click="store.excalidraw = false">
      Close Excalidraw
    </button>
    <navigation-expires />
  </div>
  <div v-if="activeCowork?.session.state.banner" class="bg-amber-700 text-white text-center px-2 py-1" role="status">{{ activeCowork.session.state.banner }}</div>
  <div v-if="membersOpen && activeCowork" class="bg-black text-white px-4 py-2 border-t border-white/20 flex gap-4 items-center">
    <span v-for="peer in activeCowork.session.state.participants" :key="peer.peerId" :style="{ color: peer.color }">{{ peer.name }}{{ peer.connected ? '' : ' (connecting)' }}</span>
    <button class="border border-white px-2 py-0.5" @click="leaveCowork(); membersOpen = false">Leave session</button>
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
import { isRunnableLanguage } from '~/lib/sandbox/runners';
import { canFormatNote } from '~/lib/format/availability';
import { canStartCowork } from '~/lib/monaco/editor-actions';
import { activeCowork, coworkShareOpen, leaveCowork } from '~/lib/cowork/active';
import { TOOLS } from '~/lib/tools/registry';
const store = useAppStore();
const settings = useSettingsStore();
const membersOpen = ref(false);

const runnable = computed(() => isRunnableLanguage(store.getCurrentLanguage().id));
const formatAvailable = computed(() => canFormatNote(store, store.getCurrentLanguage().id));

const entries = computed<NavigationEntry[]>(() => [
  {
    name: "File",
    entries: [
      {
        name: "Save",
        onClick: activeCowork.value ? () => activeCowork.value?.session.saveAsNote() : Actions.SAVE,
      },
      ...(activeCowork.value ? [{ name: 'Save as note', onClick: () => activeCowork.value?.session.saveAsNote() }] : []),
      {
        name: "Save for custom time",
        onClick: Actions.SAVE_FOR_CUSTOM_TIME,
        disabled: store.settings || !!activeCowork.value,
        title: activeCowork.value ? 'Use Save as note during a cowork session' : store.settings ? "Cant save settings for custom time" : undefined,
      },
      {
        name: "Save until read",
        onClick: Actions.SAVE_UNTIL_READ,
        disabled: store.settings || !!activeCowork.value,
        title: activeCowork.value ? 'Use Save as note during a cowork session' : store.settings ? "Cant save settings until read" : undefined,
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
      ...(canStartCowork(store) ? [{ name: 'Start cowork', onClick: Actions.START_COWORK }] : []),
      {
        name: "Copy Link",
        onClick: Actions.SHARE_LINK
      },
      {
        name: "Copy cURL Command",
        onClick: Actions.SHARE_CURL,
        disabled: !!activeCowork.value,
        title: activeCowork.value ? 'Live sessions do not have a cURL command' : undefined,
      }
    ],
    disabled: store.settings,
  },
  {
    name: "Tools",
    entries: [
      { name: 'Tools…', onClick: Actions.OPEN_TOOLS },
      ...[...new Set(TOOLS.map(tool => tool.category))].map(category => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        entries: TOOLS.filter(tool => tool.category === category).map(tool => ({ name: tool.title, onClick: () => Actions.OPEN_TOOL(tool.id) })),
      })),
      ...(formatAvailable.value ? [{ name: "Format", onClick: Actions.FORMAT }] : []),
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
        name: "P2P Transfer",
        onClick: Actions.OPEN_P2P_SEND,
        disabled: !store.info.p2pEnabled || store.settings,
        title: !store.info.p2pEnabled
          ? "This server does not have P2P transfers enabled."
          : store.settings
            ? "Cant open P2P transfer while settings editor is open"
            : undefined,
      },
      {
        name: (store.excalidraw ? "Close" : "Open") + " Excalidraw",
        onClick: Actions.OPEN_EXCALIDRAW,
        disabled: !store.config.drawURL || store.settings || !!activeCowork.value,
        title: !store.config.drawURL
          ? "Excalidraw URL is not configured"
          : activeCowork.value
            ? 'Leave the text session before opening Excalidraw'
          : store.settings
            ? "Cant open Excalidraw while settings editor is open"
            : undefined,
      },
      {
        name: store.sandbox ? "Close Run / Preview" : "Run / Preview",
        onClick: Actions.OPEN_SANDBOX,
        disabled: store.settings || (!store.sandbox && !isRunnableLanguage(store.getCurrentLanguage().id)),
        title: store.settings
          ? "Cant run code while settings editor is open"
          : !store.sandbox && !isRunnableLanguage(store.getCurrentLanguage().id)
            ? "This language cannot be run or previewed"
            : undefined,
      },
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
