import { describe, expect, it } from 'vitest';
import { buildThemeBootstrapScript, buildThemeBootstrapStyle, themeBootstrapScript } from '~/lib/theme/bootstrap';
import { THEMES, type ThemeDefinition } from '~/lib/theme/registry';

function runBootstrap(script: string, storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>) {
  const root = document.documentElement;
  root.removeAttribute('style');
  root.removeAttribute('data-theme');
  root.removeAttribute('data-theme-ready');
  document.head.innerHTML = '<meta name="theme-color" content="#000000">';
  new Function('document', 'localStorage', script)(document, storage);
  return root;
}

describe('theme first-paint bootstrap', () => {
  it.each(THEMES.filter(theme => theme.id !== 'custom'))('applies registry palette for $id', theme => {
    const storage = {
      getItem: () => JSON.stringify({ theme: theme.id }),
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    const root = runBootstrap(themeBootstrapScript, storage);
    expect(root.dataset.theme).toBe(theme.id);
    expect(root.hasAttribute('data-theme-ready')).toBe(true);
    expect(root.style.colorScheme).toBe(theme.scheme);
    for (const [name, value] of Object.entries(theme.vars)) {
      expect(root.style.getPropertyValue(`--not3-${name}`)).toBe(value);
    }
    expect(root.style.getPropertyValue('--not3-surface')).toBe(theme.surface);
  });

  it('automatically includes a newly registered built-in', () => {
    const extra = { ...THEMES[0]!, id: 'future', surface: '1 2 3', vars: { ...THEMES[0]!.vars, bg: '4 5 6' } } as ThemeDefinition;
    const script = buildThemeBootstrapScript([...THEMES, extra]);
    const root = runBootstrap(script, {
      getItem: () => JSON.stringify({ theme: 'future' }),
      setItem: () => undefined,
      removeItem: () => undefined,
    });
    expect(root.dataset.theme).toBe('future');
    expect(root.style.getPropertyValue('--not3-bg')).toBe('4 5 6');
    expect(root.style.getPropertyValue('--not3-surface')).toBe('1 2 3');
  });

  it('generates the early Default CSS from the registry', () => {
    const theme = THEMES.find(item => item.id === 'default')!;
    const style = buildThemeBootstrapStyle(theme);
    for (const [name, value] of Object.entries(theme.vars)) {
      expect(style).toContain(`--not3-${name}: ${value}`);
    }
    expect(style).toContain(`--not3-surface: ${theme.surface}`);
  });

  it('still reveals Default when storage access and cleanup are denied', () => {
    const denied = () => { throw new Error('storage denied'); };
    const root = runBootstrap(themeBootstrapScript, {
      getItem: denied,
      setItem: denied,
      removeItem: denied,
    });
    expect(root.dataset.theme).toBe('default');
    expect(root.hasAttribute('data-theme-ready')).toBe(true);
  });
});
