import { CUSTOM_CSS_LOADED_EVENT, syncCustomCss } from '~/lib/theme/custom-css'
import { activeTheme } from '~/lib/theme/registry'

export default defineNuxtPlugin(() => {
  const store = useAppStore()
  const root = document.documentElement
  const loaded = new WeakSet<HTMLLinkElement>()
  let pending: HTMLLinkElement | null = null

  const keepHidden = () => {
    if (pending?.isConnected && !loaded.has(pending) && activeTheme.value.id === 'custom') {
      root.removeAttribute('data-theme-ready')
    }
  }
  new MutationObserver(keepHidden).observe(root, { attributes: true, attributeFilter: ['data-theme-ready'] })

  const settle = (link: HTMLLinkElement) => {
    loaded.add(link)
    if (pending !== link || activeTheme.value.id !== 'custom') return
    pending = null
    window.dispatchEvent(new Event(CUSTOM_CSS_LOADED_EVENT))
    root.setAttribute('data-theme-ready', '')
  }

  const sync = () => {
    syncCustomCss(activeTheme.value.id, store.config)
    const element = document.getElementById('not3-custom-css')
    const link = element instanceof HTMLLinkElement ? element : null
    if (link && !loaded.has(link)) {
      if (pending !== link) {
        pending = link
        link.addEventListener('load', () => settle(link), { once: true })
        link.addEventListener('error', () => settle(link), { once: true })
      }
    } else pending = null
    keepHidden()
  }

  watch(
    () => [activeTheme.value.id, store.config.customCSS, store.config.customCSSURL],
    sync,
    { immediate: true, flush: 'sync' },
  )
})
