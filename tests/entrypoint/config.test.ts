import { describe, expect, it } from 'vitest'
import { buildConfig } from '../../entrypoint/config.mjs'

describe('operator config', () => {
  it('maps supplied theme and CSS keys while omitting unset keys', () => {
    expect(buildConfig({ API_URL: '/remote/', THEME: 'white', CUSTOM_CSS: ':root { --not3-bg: 255 0 0; }' })).toEqual({
      baseURL: '/remote/',
      drawURL: '/api/draw/',
      termsURL: undefined,
      theme: 'white',
      customCSS: ':root { --not3-bg: 255 0 0; }',
    })
    expect(buildConfig({ THEME: '', CUSTOM_CSS: '', CUSTOM_CSS_URL: '' })).toEqual({
      baseURL: '/api/',
      drawURL: '/api/draw/',
      termsURL: undefined,
    })
  })

  it('maps URL CSS when supplied alongside raw CSS', () => {
    expect(buildConfig({ CUSTOM_CSS: 'body {}', CUSTOM_CSS_URL: '/theme.css' })).toMatchObject({
      customCSS: 'body {}',
      customCSSURL: '/theme.css',
    })
  })

  it('omits whitespace-only operator values', () => {
    expect(buildConfig({ THEME: ' ', CUSTOM_CSS: '\n', CUSTOM_CSS_URL: '  ' })).toEqual({
      baseURL: '/api/',
      drawURL: '/api/draw/',
      termsURL: undefined,
    })
  })
})
