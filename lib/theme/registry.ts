import { readonly, shallowRef } from 'vue';

export type ThemeId = 'default' | 'monokai' | 'white' | 'custom';
export type ThemeScheme = 'dark' | 'light';
export type ThemeVar = 'bg' | 'fg' | 'panel' | 'accent';

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  scheme: ThemeScheme;
  monacoTheme: string;
  vars: Record<ThemeVar, string>;
  surface: string;
}

export const THEMES: readonly ThemeDefinition[] = [
  { id: 'default', label: 'Default', scheme: 'dark', monacoTheme: 'custom-dark', vars: { bg: '0 0 0', fg: '255 255 255', panel: '17 17 17', accent: '255 255 255' }, surface: '30 30 30' },
  { id: 'monokai', label: 'Monokai', scheme: 'dark', monacoTheme: 'not3-monokai', vars: { bg: '39 40 34', fg: '248 248 242', panel: '30 31 28', accent: '166 226 46' }, surface: '39 40 34' },
  { id: 'white', label: 'White', scheme: 'light', monacoTheme: 'not3-light', vars: { bg: '255 255 255', fg: '0 0 0', panel: '243 243 243', accent: '0 0 0' }, surface: '243 243 243' },
  { id: 'custom', label: 'Custom', scheme: 'dark', monacoTheme: 'custom-dark', vars: { bg: '0 0 0', fg: '255 255 255', panel: '17 17 17', accent: '255 255 255' }, surface: '30 30 30' },
];
const active = shallowRef<ThemeDefinition>(THEMES[0]!);
export const activeTheme = readonly(active);

const THEME_VARS: readonly ThemeVar[] = ['bg', 'fg', 'panel', 'accent'];

export function themeColor(theme: ThemeDefinition): string {
  const hex = theme.vars.bg.split(' ').map(channel => Number(channel).toString(16).padStart(2, '0')).join('');
  return `#${hex}`;
}

export function resolveTheme(input: {
  setting: ThemeId | null;
  configDefault?: string;
  hasCustomCss: boolean;
}): ThemeDefinition {
  const id = input.setting ?? input.configDefault ?? 'default';
  if (id === 'custom' && !input.hasCustomCss) return THEMES[0]!;
  return THEMES.find(theme => theme.id === id) ?? THEMES[0]!;
}

export function applyTheme(theme: ThemeDefinition, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = theme.id;
  root.style.colorScheme = theme.scheme;
  for (const name of THEME_VARS) {
    if (theme.id === 'custom') root.style.removeProperty(`--not3-${name}`);
    else root.style.setProperty(`--not3-${name}`, theme.vars[name]);
  }
  if (theme.id === 'custom') root.style.removeProperty('--not3-surface');
  else root.style.setProperty('--not3-surface', theme.surface);
  const doc = root.ownerDocument;
  let meta = doc.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = doc.createElement('meta');
    meta.name = 'theme-color';
    doc.head.append(meta);
  }
  meta.content = themeColor(theme);
  active.value = theme;
}
