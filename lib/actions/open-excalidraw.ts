import { YesNoDialog } from "../dialog";

export const OPEN_EXCALIDRAW = () => {
  const store = useAppStore();
  if (!store.config.drawURL) return;
  if (store.settings) return;
  if (store.excalidraw) {
    store.excalidraw = false;
    return;
  }
  let valid = true;
  if (!store.content.startsWith('{"type":"EXCALIDRAW",')) valid = false;
  else try {
    JSON.parse(store.content);
  } catch {
    valid = false;
  }
  if (store.content === "" || store.content === "{}") valid = true;
  if (!valid) store.dialog = new YesNoDialog(
    "Excalidraw Error",
    [
      "The current note does not contain valid Excalidraw data.",
      "Do you want to open Excalidraw anyway?",
      ...(store.readonly ? [] : [
        "Be aware that opening Excalidraw will overwrite the current note content.",
      ]),
    ].join(" "),
    () => store.excalidraw = true,
    () => store.excalidraw = false,
  );
  else store.excalidraw = true;
}
