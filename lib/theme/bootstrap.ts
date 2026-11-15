import { THEMES, themeColor, type ThemeDefinition } from './registry';

const defaultTheme = THEMES.find(theme => theme.id === 'default')!;

export function buildThemeBootstrapStyle(theme: ThemeDefinition = defaultTheme): string {
  const vars = Object.entries(theme.vars).map(([name, value]) => `--not3-${name}: ${value};`).join(' ');
  return `:root { ${vars} --not3-surface: ${theme.surface}; color-scheme: ${theme.scheme}; } body { background-color: rgb(var(--not3-bg)); color: rgb(var(--not3-fg)); } html:not([data-theme-ready]) body { visibility: hidden; }`;
}

export function buildThemeBootstrapScript(themes: readonly ThemeDefinition[] = THEMES): string {
  const palette = Object.fromEntries(themes.filter(theme => theme.id !== 'custom').map(theme => [theme.id, {
    vars: theme.vars,
    surface: theme.surface,
    scheme: theme.scheme,
    meta: themeColor(theme),
  }]));
  const serialized = JSON.stringify(palette).replace(/</g, '\\u003c');
  return `(() => {
  const root = document.documentElement;
  const colors = ${serialized};
  let id = null;
  try {
    if (!localStorage.getItem('settings')) {
      const cookie = document.cookie.split('; ').find(entry => entry.startsWith('settings='));
      if (cookie) {
        try {
          const previous = decodeURIComponent(cookie.slice('settings='.length));
          const parsed = JSON.parse(previous);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) localStorage.setItem('settings', previous);
        } catch { /* Ignore an invalid legacy cookie. */ }
      }
    }
    const stored = localStorage.getItem('settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      id = parsed && typeof parsed === 'object' ? parsed.theme : null;
    }
  } catch {
    try { localStorage.removeItem('settings'); } catch { /* Storage may be denied. */ }
    id = 'default';
  }
  if (id === null || id === 'custom') return;
  if (!Object.prototype.hasOwnProperty.call(colors, id)) id = 'default';
  const values = colors[id];
  for (const [name, value] of Object.entries(values.vars)) root.style.setProperty('--not3-' + name, value);
  root.style.setProperty('--not3-surface', values.surface);
  root.style.colorScheme = values.scheme;
  root.dataset.theme = id;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', values.meta);
  root.setAttribute('data-theme-ready', '');
})();`;
}

export const themeBootstrapStyle = buildThemeBootstrapStyle();
export const themeBootstrapScript = buildThemeBootstrapScript();
