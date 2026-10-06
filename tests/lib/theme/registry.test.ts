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
    ['monokai', 'dark', '39 40 34', '248 248 242', '30 31 28', '166 226 46', '#272822'],
    ['white', 'light', '255 255 255', '0 0 0', '243 243 243', '0 0 0', '#ffffff'],
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
