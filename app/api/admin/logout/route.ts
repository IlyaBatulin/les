import { NextResponse } from "next/server"
import { clearAdminSessionCookie } from "@/lib/admin-auth"
import { checkRequestOrigin } from "@/lib/admin-http"
export async function POST(request: Request) {
  if (!checkRequestOrigin(request)) return NextResponse.json({ error: "Недопустимый источник запроса" }, { status: 403 })
  await clearAdminSessionCookie()
  return NextResponse.json({ ok: true })
}
