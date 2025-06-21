export const SAVE = () => {
  const store = useAppStore();
  store.saveEncryptedNote();
}
