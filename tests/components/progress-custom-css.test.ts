import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { onMounted, ref, watch } from 'vue'
import ProgressBar from '~/components/progress/bar.vue'
import ProgressSquare from '~/components/progress/square.vue'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('style')
})

for (const [name, component] of [['bar', ProgressBar], ['square', ProgressSquare]] as const) {
  it(`repaints the ${name} canvas after Custom URL CSS loads`, () => {
    vi.stubGlobal('ref', ref)
    vi.stubGlobal('watch', watch)
    vi.stubGlobal('onMounted', onMounted)
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(64)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(32)
    const paints: string[] = []
    const ctx = {
      canvas: { width: 0, height: 0 },
      fillStyle: '',
      clearRect() {},
      fillRect() { paints.push(this.fillStyle) },
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
    const root = document.documentElement
    root.style.setProperty('--not3-bg', '0 0 0')
    root.style.setProperty('--not3-fg', '255 255 255')
    const wrapper = mount(component, { props: { status: 1, total: 1 } })
    expect(paints).toContain('rgb(255, 255, 255)')
    const before = paints.length
    root.style.setProperty('--not3-bg', '210 0 0')
    root.style.setProperty('--not3-fg', '0 100 200')
    window.dispatchEvent(new Event('not3-custom-css-loaded'))
    expect(paints.length).toBeGreaterThan(before)
    expect(paints.at(-1)).toBe('rgb(0, 100, 200)')
    wrapper.unmount()
  })
}
