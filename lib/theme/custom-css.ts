export type CustomCssConfig = { customCSS?: string; customCSSURL?: string }
export const CUSTOM_CSS_LOADED_EVENT = 'not3-custom-css-loaded'

export function hasCustomCss(config: CustomCssConfig): boolean {
  return !!(config.customCSS?.trim() || config.customCSSURL?.trim())
}

export function syncCustomCss(activeTheme: string | null, config: CustomCssConfig): void {
  const existing = document.getElementById('not3-custom-css')
  const url = config.customCSSURL?.trim() || ''
  const css = config.customCSS?.trim() ? config.customCSS : ''
  if (activeTheme !== 'custom' || (!url && !css)) {
    existing?.remove()
    return
  }

  // A URL takes precedence when both forms are configured.
  const kind = url ? 'LINK' : 'STYLE'
  const reusable = existing?.tagName === kind && (!url || existing.getAttribute('href') === url)
  if (!reusable) existing?.remove()
  const element = reusable && existing ? existing : document.createElement(url ? 'link' : 'style')
  element.id = 'not3-custom-css'
  if (url) {
    const link = element as HTMLLinkElement
    link.rel = 'stylesheet'
    link.href = url
  } else {
    element.textContent = css
  }
  if (!element.isConnected) document.head.append(element)
}
