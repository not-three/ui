import { syncCustomCss } from '~/lib/theme/custom-css'
import { activeTheme } from '~/lib/theme/registry'

export default defineNuxtPlugin(() => {
  const store = useAppStore()
  watch(
    () => [activeTheme.value.id, store.config.customCSS, store.config.customCSSURL],
    () => syncCustomCss(activeTheme.value.id, store.config),
    { immediate: true, flush: 'sync' },
  )
})
