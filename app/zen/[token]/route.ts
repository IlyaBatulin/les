import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  return ctx.params.then(({ token }) => {
    const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="zen-verification" content="${escapeHtmlAttr(token)}" />
  </head>
  <body></body>
</html>`

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    })
  })
}

function escapeHtmlAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

