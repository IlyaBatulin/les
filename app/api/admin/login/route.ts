import { NextResponse } from "next/server"
import { checkAdminCredentials, setAdminSessionCookie } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username = String(body?.username ?? "")
    const password = String(body?.password ?? "")

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "Логин и пароль обязательны" }, { status: 400 })
    }

    if (!checkAdminCredentials(username, password)) {
      return NextResponse.json({ ok: false, error: "Неверный логин или пароль" }, { status: 401 })
    }

    await setAdminSessionCookie()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Ошибка сервера" }, { status: 500 })
  }
}
