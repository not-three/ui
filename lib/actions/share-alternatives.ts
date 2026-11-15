import { FragmentData } from "@not3/sdk";
import { ShareAlternativesDialog } from "../dialog";
import { createShareAlternatives } from '../share-alternatives';
import { activeCowork } from '~/lib/cowork/active';

export const SHARE_CURL = () => {
  if (activeCowork.value) return;
  const store = useAppStore();
  if (!store.readonly) {
    store.saveEncryptedNote(undefined, undefined, 'alternatives');
  } else {
    const fragment = FragmentData.fromURL(window.location.href);
    store.dialog = new ShareAlternativesDialog(createShareAlternatives(
      { kind: 'note', id: store.id, seed: fragment.seed, cryptoMode: fragment.cryptoMode, fragment },
      fragment.server || store.config.baseURL,
      store.config.baseURL,
      useRuntimeConfig().public.uiBaseURL || '/',
      window.location.origin,
    ));
  }
}
