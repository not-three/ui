export function buildConfig(env) {
  return {
    baseURL: env.API_URL || '/api/',
    drawURL: env.DRAW_URL || '/api/draw/',
    termsURL: env.TERMS_OF_SERVICE_URL,
    ...(env.THEME?.trim() ? { theme: env.THEME } : {}),
    ...(env.CUSTOM_CSS?.trim() ? { customCSS: env.CUSTOM_CSS } : {}),
    ...(env.CUSTOM_CSS_URL?.trim() ? { customCSSURL: env.CUSTOM_CSS_URL } : {}),
  }
}
