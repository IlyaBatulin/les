import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET() {
  if (!(await checkAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getDb()
    const [productsRes, categoriesRes, ordersRes, newOrdersRes] = await Promise.all([
      db.query("SELECT COUNT(*)::int as c FROM products"),
      db.query("SELECT COUNT(*)::int as c FROM categories"),
      db.query("SELECT COUNT(*)::int as c FROM orders"),
      db.query("SELECT COUNT(*)::int as c FROM orders WHERE status = 'new'"),
    ])

    return NextResponse.json({
      productsCount: productsRes.rows[0]?.c ?? 0,
      categoriesCount: categoriesRes.rows[0]?.c ?? 0,
      ordersCount: ordersRes.rows[0]?.c ?? 0,
      newOrdersCount: newOrdersRes.rows[0]?.c ?? 0,
    })
  } catch (error) {
    console.error("Admin stats API error:", error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}
