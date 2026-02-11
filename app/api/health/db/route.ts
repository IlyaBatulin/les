import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    const db = getDb()
    const result = await db.query("SELECT now()")
    return NextResponse.json({
      ok: true,
      time: result.rows[0]?.now,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("DB health check failed:", err.message)
    console.error("  code:", (error as NodeJS.ErrnoException)?.code)
    console.error("  cause:", (error as { cause?: unknown })?.cause)
    console.error("  stack:", err.stack)
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
