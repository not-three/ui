export default defineEventHandler(async (event) => {
  if (!process.env.PROXY_URL) return new Response('API proxy not configured', { status: 418 })
  const url = `${process.env.PROXY_URL}${process.env.PROXY_URL.endsWith('/') ? '' : '/'}${event.path.slice('/api/'.length)}`
  return await proxyRequest(event, url)
})
