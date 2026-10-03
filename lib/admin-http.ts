import { NextResponse } from "next/server"
import { checkAdminSession } from "@/lib/admin-auth"
import { AdminError } from "@/lib/admin-validation"

export function checkRequestOrigin(request: Request) {
  const origin = request.headers.get("origin")
  // Requests without Origin (e.g. scripts) must still have the HttpOnly session.
  if (request.headers.get("sec-fetch-site") === "cross-site") return false
  if (!origin) return true
  try {
    const expected = new URL(process.env.SITE_URL || request.url).origin
    return origin === expected
  } catch { return false }
}
export async function authorizeAdminRequest(request: Request) {
  if (!(await checkAdminSession())) return NextResponse.json({ error: "Необходим вход" }, { status: 401 })
  if (!checkRequestOrigin(request)) return NextResponse.json({ error: "Недопустимый источник запроса" }, { status: 403 })
  return null
}
export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminError) return NextResponse.json({ error: error.message }, { status: error.status })
  if (error instanceof SyntaxError) return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 })
  console.error("Admin operation failed", { code: (error as { code?: string })?.code })
  return NextResponse.json({ error: "Не удалось выполнить операцию" }, { status: 500 })
}
