import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    databaseUrlSet: !!process.env.DATABASE_URL,
    supabaseUrlSet: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    ),
    supabaseAnonSet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
