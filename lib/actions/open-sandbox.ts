import { OkDialog, YesNoDialog } from "../dialog";
import { sandboxModeForLanguage } from "../sandbox/srcdoc";

export const OPEN_SANDBOX = () => {
  const store = useAppStore();
  const settings = useSettingsStore();
  if (store.settings) return;
  if (store.sandbox) {
    store.sandbox = false;
    return;
  }
  if (!sandboxModeForLanguage(store.getCurrentLanguage().id)) {
    store.dialog = new OkDialog(
      "Run / Preview",
      "Only JavaScript and HTML notes can be run. Select one of these languages in the bottom bar first.",
    );
    return;
  }
  const open = () => {
    store.excalidraw = false;
    store.sandbox = true;
  };
  if (store.readonly && settings.warnings.runCode) {
    store.dialog = new YesNoDialog(
      "Run this note?",
      [
        "This will execute the code contained in this note inside a sandboxed iframe.",
        "The sandbox cannot access your notes, keys or cookies, and network access",
        "stays disabled unless you enable it in the panel.",
        "Only continue if you trust this note.",
      ].join(" "),
      open,
    );
  } else {
    open();
  }
};
