export const OPEN_SETTINGS = () => {
  const store = useAppStore();
  store.pushToRouter("/settings");
}
