export default defineEventHandler(async (event) => {
  if (event.path.startsWith("/api/draw/")) {
    if (!process.env.DRAW_PROXY_URL)
      return new Response("Draw API proxy not configured", { status: 418 });
    const url = `${process.env.DRAW_PROXY_URL}${process.env.DRAW_PROXY_URL.endsWith("/") ? "" : "/"}${event.path.slice("/api/draw/".length)}`;
    return await proxyRequest(event, url, {
      fetchOptions: { redirect: "manual" },
    });
  } else {
    if (!process.env.PROXY_URL)
      return new Response("API proxy not configured", { status: 418 });
    const url = `${process.env.PROXY_URL}${process.env.PROXY_URL.endsWith("/") ? "" : "/"}${event.path.slice("/api/".length)}`;
    return await proxyRequest(event, url, {
      fetchOptions: { redirect: "manual" },
    });
  }
});
