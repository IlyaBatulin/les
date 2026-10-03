import { checkAdminSession } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  if (!(await checkAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({
    databaseUrlSet: !!process.env.DATABASE_URL,
    supabaseUrlSet: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    ),
    supabaseAnonSet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
