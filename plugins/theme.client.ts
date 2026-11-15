import { watch } from 'vue';
import { activeTheme, applyTheme, resolveTheme, type ThemeId } from '~/lib/theme/registry';

type ThemeConfig = { theme?: string; customCSS?: string; customCSSURL?: string };

export default defineNuxtPlugin(async () => {
  const settings = useSettingsStore();
  const app = useAppStore();
  const explicit = settings.theme;
  if (explicit === 'default' || explicit === 'monokai' || explicit === 'white') {
    applyTheme(resolveTheme({ setting: explicit, hasCustomCss: false }));
    document.documentElement.setAttribute('data-theme-ready', '');
  }

  // Config is needed before the first visible app frame for an unset choice.
  try {
    const base = useRuntimeConfig().public.uiBaseURL || '/';
    const response = await fetch(`${base}config.json`);
    if (response.ok) app.config = await response.json();
  } catch (error) {
    console.warn('Could not load UI config for theme selection', error);
  }

  watch(() => [settings.theme, app.config] as const, ([setting, config]) => {
    const configured = config as ThemeConfig;
    const hasCustomCss = !!(configured.customCSS?.trim() || configured.customCSSURL?.trim());
    const selected = resolveTheme({
      setting: setting as ThemeId | null,
      configDefault: configured.theme,
      hasCustomCss,
    });
    if (selected !== activeTheme.value || document.documentElement.dataset.theme !== selected.id) {
      applyTheme(selected);
    }
    document.documentElement.setAttribute('data-theme-ready', '');
  }, { immediate: true, deep: true });
});
