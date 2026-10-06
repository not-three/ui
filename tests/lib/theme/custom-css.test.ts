import { afterEach, describe, expect, it } from 'vitest'
import { syncCustomCss } from '~/lib/theme/custom-css'

afterEach(() => {
  document.getElementById('not3-custom-css')?.remove()
  document.documentElement.removeAttribute('style')
})

describe('custom CSS lifecycle', () => {
  it('inserts raw CSS only for Custom and removes it when leaving', () => {
    syncCustomCss('custom', { customCSS: ':root { --not3-bg: 200 0 0; }' })
    expect(document.querySelectorAll('#not3-custom-css')).toHaveLength(1)
    expect(document.querySelector('#not3-custom-css')?.tagName).toBe('STYLE')
    expect(document.querySelector('#not3-custom-css')?.textContent).toContain('--not3-bg: 200 0 0')
    syncCustomCss('white', { customCSS: ':root { --not3-bg: 200 0 0; }' })
    expect(document.querySelector('#not3-custom-css')).toBeNull()
  })

  it('prefers a URL and keeps one element through rapid changes', () => {
    const config = { customCSS: 'body { color: red; }', customCSSURL: 'data:text/css,body%20%7B%20color%3A%20blue%3B%20%7D' }
    syncCustomCss('custom', config)
    expect(document.querySelector('#not3-custom-css')?.tagName).toBe('LINK')
    expect(document.querySelector<HTMLLinkElement>('#not3-custom-css')?.getAttribute('href')).toBe(config.customCSSURL)
    syncCustomCss('white', config)
    syncCustomCss('custom', config)
    expect(document.querySelectorAll('#not3-custom-css')).toHaveLength(1)
    syncCustomCss('default', config)
    expect(document.querySelectorAll('#not3-custom-css')).toHaveLength(0)
  })

  it('treats empty CSS values as unavailable', () => {
    syncCustomCss('custom', { customCSS: ' ', customCSSURL: '\n' })
    expect(document.querySelector('#not3-custom-css')).toBeNull()
  })

  it('replaces a URL link when the operator changes the URL', () => {
    const first = 'data:text/css,body%7Bcolor%3Ared%7D'
    const second = 'data:text/css,body%7Bcolor%3Ablue%7D'
    syncCustomCss('custom', { customCSSURL: first })
    const oldLink = document.getElementById('not3-custom-css')
    syncCustomCss('custom', { customCSSURL: second })
    expect(document.querySelectorAll('#not3-custom-css')).toHaveLength(1)
    expect(document.getElementById('not3-custom-css')).not.toBe(oldLink)
    expect(document.querySelector<HTMLLinkElement>('#not3-custom-css')?.getAttribute('href')).toBe(second)
  })
})
