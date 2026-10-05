import { TextOutputDialog } from "../dialog";
import { activeCowork, coworkShareOpen } from '~/lib/cowork/active';

export const SHARE_LINK = () => {
  if (activeCowork.value) { coworkShareOpen.value = true; return; }
  const store = useAppStore();
  if (!store.readonly) {
    store.saveEncryptedNote(undefined, undefined, 'url');
  } else {
    store.dialog = new TextOutputDialog(
      "Share Link",
      "Copy the following link to share the note.",
      window.location.href,
    );
    navigator.clipboard.writeText(window.location.href);
  }
}
