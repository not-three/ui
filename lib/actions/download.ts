export const DOWNLOAD = () => {
  const store = useAppStore();
  const lang = store.getCurrentLanguage();
  const type = lang.mimeTypes ? lang.mimeTypes[0] : "text/plain";
  const extension = lang.extensions ? lang.extensions[0] : ".txt";
  const rand = Math.random().toString(36).substring(7);
  const blob = new Blob([store.content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `not3-${rand}${extension}`;
  a.click();
}
