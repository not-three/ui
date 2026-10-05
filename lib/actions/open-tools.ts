import { getTool } from '~/lib/tools/registry';

export const OPEN_TOOLS = () => { void useRouter().push('/t'); };
export const OPEN_TOOL = (id: string) => {
  if (!getTool(id)) return;
  const store = useAppStore();
  store.activeToolId = id;
  store.sidePanel = 'tools';
};
