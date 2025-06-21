export const SAVE_UNTIL_READ = () => {
  const store = useAppStore();
  if (store.settings) return;
  store.saveEncryptedNote(undefined, true);
}
