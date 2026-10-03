import { NextResponse } from "next/server"
import { checkAdminSession } from "@/lib/admin-auth"
export async function GET() {
  return NextResponse.json({ authenticated: await checkAdminSession() }, { headers: { "Cache-Control": "no-store" } })
}
