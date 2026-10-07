import { beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, resolveTheme, THEMES } from '~/lib/theme/registry';

const byId = (id: string) => THEMES.find(theme => theme.id === id)!;

describe('resolveTheme', () => {
  it('uses Default when no user or operator choice exists', () => {
    expect(resolveTheme({ setting: null, hasCustomCss: false }).id).toBe('default');
  });

  it('uses the operator default for an unset user choice', () => {
    expect(resolveTheme({ setting: null, configDefault: 'white', hasCustomCss: false }).id).toBe('white');
  });

  it('lets an explicit user choice override the operator default', () => {
    expect(resolveTheme({ setting: 'monokai', configDefault: 'white', hasCustomCss: false }).id).toBe('monokai');
  });

  it('falls back for unknown IDs and Custom without CSS', () => {
    expect(resolveTheme({ setting: 'other' as never, hasCustomCss: true }).id).toBe('default');
    expect(resolveTheme({ setting: null, configDefault: 'other', hasCustomCss: true }).id).toBe('default');
    expect(resolveTheme({ setting: 'custom', configDefault: 'white', hasCustomCss: false }).id).toBe('default');
    expect(resolveTheme({ setting: null, configDefault: 'custom', hasCustomCss: false }).id).toBe('default');
  });

  it('allows Custom only when operator CSS exists', () => {
    expect(resolveTheme({ setting: 'custom', hasCustomCss: true }).id).toBe('custom');
  });
});

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('style');
    document.head.innerHTML = '<meta name="theme-color" content="#000000">';
  });

  it.each([
    ['default', 'dark', '0 0 0', '255 255 255', '17 17 17', '255 255 255', '#000000'],
    ['monokai', 'dark', '22 23 18', '248 248 242', '30 31 28', '166 226 46', '#161712'],
    ['white', 'light', '228 228 228', '0 0 0', '242 242 242', '0 0 0', '#e4e4e4'],
  ])('sets %s DOM theme and semantic colors', (id, scheme, bg, fg, panel, accent, meta) => {
    applyTheme(byId(id));
    const root = document.documentElement;
    expect(root.dataset.theme).toBe(id);
    expect(root.style.colorScheme).toBe(scheme);
    expect(root.style.getPropertyValue('--not3-bg')).toBe(bg);
    expect(root.style.getPropertyValue('--not3-fg')).toBe(fg);
    expect(root.style.getPropertyValue('--not3-panel')).toBe(panel);
    expect(root.style.getPropertyValue('--not3-accent')).toBe(accent);
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(meta);
  });

  it('removes inline channels for Custom so a later root rule can win', () => {
    applyTheme(byId('white'));
    applyTheme(byId('custom'));
    const root = document.documentElement;
    expect(root.dataset.theme).toBe('custom');
    expect(root.style.colorScheme).toBe('dark');
    for (const name of ['bg', 'fg', 'panel', 'accent']) {
      expect(root.style.getPropertyValue(`--not3-${name}`)).toBe('');
    }
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#000000');
  });
});

describe('palette contrast', () => {
  const luminance = (channels: string) => channels.split(' ').map(Number).reduce((sum, value) => sum + value, 0) / 3;

  it.each(THEMES.filter(theme => theme.id !== 'custom').map(theme => [theme.id, theme] as const))(
    '%s frames the editor with a darker title bar and a distinct side panel',
    (_id, theme) => {
      // The title bar, menus and dialogs paint with `bg`; the editor sits on
      // `surface`. Without a visible step between them the frame disappears.
      expect(luminance(theme.vars.bg)).toBeLessThan(luminance(theme.surface) - 10);
      expect(luminance(theme.vars.panel)).toBeGreaterThan(luminance(theme.vars.bg));
      expect(luminance(theme.vars.panel)).toBeLessThan(luminance(theme.surface));
    },
  );
});
