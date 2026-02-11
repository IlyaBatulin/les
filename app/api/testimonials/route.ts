import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    const db = getDb()
    const r = await db.query(
      `SELECT id, name, position, message, rating, image_url, created_at FROM testimonials ORDER BY created_at DESC`
    )
    return NextResponse.json(r.rows)
  } catch (e) {
    console.error("Testimonials GET error:", e)
    return NextResponse.json([], { status: 200 })
  }
}
