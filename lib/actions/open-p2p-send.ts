export const OPEN_P2P_SEND = () => {
  const store = useAppStore();
  if (!store.info.p2pEnabled || store.settings) return;
  store.p2pSend = true;
};
