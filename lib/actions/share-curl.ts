import { FragmentData, ShareGenerator } from "@not3/sdk";
import { TextOutputDialog } from "../dialog";

export const SHARE_CURL = () => {
  const store = useAppStore();
  if (!store.readonly) {
    store.saveEncryptedNote(undefined, undefined, 'curl');
  } else {
    const fragment = FragmentData.fromURL(window.location.href);
    let apiUrl = fragment.server || store.config.baseURL;
    if (!apiUrl.startsWith("http")) apiUrl = window.location.origin + apiUrl;
    const cmd = new ShareGenerator({apiUrl}).noteCurl(store.id, fragment.seed);
    store.dialog = new TextOutputDialog(
      "cURL Command",
      "Copy the following cURL command to share the note.",
      cmd,
    );
    navigator.clipboard.writeText(cmd);
  }
}
