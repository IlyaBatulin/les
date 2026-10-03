import { NextResponse } from "next/server"
import { checkAdminCredentials, setAdminSessionCookie } from "@/lib/admin-auth"
import { checkRequestOrigin } from "@/lib/admin-http"
import { allowLoginAttempt, clearLoginAttempts } from "@/lib/admin-login-limit"
export const runtime = "nodejs"
export async function POST(request: Request) {
  if (!checkRequestOrigin(request)) return NextResponse.json({ error: "Недопустимый источник запроса" }, { status: 403 })
  // Один административный аккаунт: общий лимит не обходится подменой forwarded IP.
  const key = "admin"
  if (!allowLoginAttempt(key)) return NextResponse.json({ error: "Слишком много попыток. Повторите через 15 минут." }, { status: 429, headers: { "Retry-After": "900" } })
  try {
    const body = await request.json()
    if (typeof body?.username !== "string" || typeof body?.password !== "string" || !body.username || !body.password || body.username.length > 200 || body.password.length > 1000) {
      return NextResponse.json({ error: "Введите логин и пароль" }, { status: 400 })
    }
    if (!checkAdminCredentials(body.username, body.password)) return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 })
    clearLoginAttempts(key)
    await setAdminSessionCookie()
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: "Не удалось выполнить вход" }, { status: 400 }) }
}
