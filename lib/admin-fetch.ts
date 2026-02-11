import { headers } from "next/headers"

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export async function adminFetch(path: string, options?: RequestInit): Promise<Response> {
  const h = await headers()
  const cookie = h.get("cookie") || ""
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      cookie,
    },
    cache: "no-store",
  })
}
