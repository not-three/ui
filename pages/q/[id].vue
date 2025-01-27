<template>
  <gh-badge
    v-if="configData.pullRequest"
    :text="[
      'This is an preview of an pull request.',
      'Click here to view the pull request.',
    ].join('\n')"
    :to="configData.pullRequest"
  />
  <share-overview
    :visible="isNew"
    :loaded-languages="loadedLanguages"
    :detected-language="detectedLanguage"
    :current-language="currentLanguage"
    :config="configData"
    @close="isNew = false"
  />
  <yes-no
    :visible="errorVisible"
    title="Error"
    :message="errorMessage"
    @yes="errorVisible = false"
    alt-yes="Ok"
    disable-no
  />
  <yes-no
    :visible="isBurn"
    title="Warning"
    message="This file can only be viewed once. Are you sure you want to continue?"
    @yes="burn"
    disable-no
  />
  <spinner :visible="loading" />
  <nav-bar
    :config="configData"
    :expires="expires"
    :default-expires="defaultExpires"
    :burnt="burnt"
    :loaded-languages="loadedLanguages"
    :detected-language="detectedLanguage"
    :current-language="currentLanguage"
    @new="newD"
    @save="saveD"
    @duplicate="duplicateD"
    @set-language="currentLanguage = $event"
    @download="download"
    @share-overview="isNew = true"
    no-save
  />
  <editor
    v-if="isReady"
    v-model="content"
    :forced-language="currentLanguage"
    @save="saveD"
    @duplicate="duplicateD"
    @new="newD"
    @loaded="loading = false"
    @loaded-languages="loadedLanguages = $event"
    @language-detected="detectedLanguage = $event"
    readonly
  />
</template>

<script lang="ts">
import CryptoJS from 'crypto-js';
import useBase from '~/mixins/base'
import { languageDefinitions } from '~/lib/monaco/languages'
export default defineNuxtComponent({
  mixins: [useBase],
  data: () => ({
    isReady: false,
    decryptURL: '',
    expires: null as number | null,
    burnt: false,
    isNew: false,
  }),
  mounted() {
    if (!this.isBurn) this.doInit();
    const url = new URL(location.href);
    if (url.searchParams.has('new')) {
      this.isNew = localStorage.getItem('showShareOnNewAlways') !== 'false';
      url.searchParams.delete('new');
      window.history.replaceState({}, '', url.toString());
    }
  },
  methods: {
    async doInit() {
      try {
        this.readOnly = true;
        const api = await this.getApi();
        const secret = location.hash.substring(1);
        this.decryptURL = api.defaults.baseURL + `note/${this.$route.params.id}/decrypt?key=${secret}`;
        const res = await api.get(`note/${this.$route.params.id}/json`);
        try {
          this.content = CryptoJS.AES.decrypt(res.data.content, secret).toString(CryptoJS.enc.Utf8);
        } catch (e) {
          console.error(e);
          this.$router.push('/?e=401');
        }
        this.isReady = true;
        this.expires = res.data.expiresAt * 1000;
        this.burnt = !!res.data.deleted;
        this.currentLanguage = languageDefinitions.find(l => l.mimeTypes?.includes(res.data.mime))?.id || 'plaintext';
      } catch (e) {
        console.error(e);
        this.$router.push('/?e=404');
      }
    },
    burn() {
      const params = new URLSearchParams(location.search);
      params.delete('burn');
      const url = `${location.pathname}?${params}${location.hash}`;
      window.history.replaceState({}, '', url);
      this.isBurn = false;
      this.doInit();
    },
  }
})
</script>
