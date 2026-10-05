import { activeCowork } from '~/lib/cowork/active';

export const SAVE = () => {
  const store = useAppStore();
  if (activeCowork.value) void activeCowork.value.session.saveAsNote();
  else store.saveEncryptedNote();
}
