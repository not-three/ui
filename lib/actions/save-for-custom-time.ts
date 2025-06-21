import { TimeDialog } from "../dialog";

export const SAVE_FOR_CUSTOM_TIME = () => {
  const store = useAppStore();
  if (store.settings) return;
  store.dialog = new TimeDialog(
    "Save for custom time",
    "How long should the note be saved?",
    24*60*60,
    store.info.maxStorageTimeDays * 24*60*60,
    (time) => store.saveEncryptedNote(time)
  )
}
