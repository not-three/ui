import { activeCowork } from '~/lib/cowork/active';

export const SAVE_UNTIL_READ = () => {
  const store = useAppStore();
  if (store.settings || activeCowork.value) return;
  store.saveEncryptedNote(undefined, true);
}
