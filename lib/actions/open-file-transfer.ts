export const OPEN_FILE_TRANSFER = () => {
  const store = useAppStore();
  if (!store.info.fileTransferEnabled) return;
  if (store.settings) return;
  store.upload = true;
}
