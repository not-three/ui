export const DUPLICATE = () => {
  const store = useAppStore();
  const win = window.open("/#duplicate", "_blank");
  win?.focus();
  win?.addEventListener("message", (e) => {
    if (e.data === "get-content") win.postMessage({
      content: store.content,
      tag: 'set-content',
    }, "*");
  });
}
