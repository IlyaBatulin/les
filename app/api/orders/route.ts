import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer_name, customer_phone, customer_email, delivery_address, comment, total_amount, items } = body
    if (!customer_name || !customer_phone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "customer_name, customer_phone and items required" }, { status: 400 })
    }
    const db = getDb()
    const productIds = items.map((i: { product_id: number }) => i.product_id)
    const checkRes = await db.query("SELECT id FROM products WHERE id = ANY($1::int[])", [productIds])
    if (checkRes.rows.length !== productIds.length) {
      return NextResponse.json({ error: "Некоторые товары недоступны" }, { status: 400 })
    }
    const orderRes = await db.query(
      `INSERT INTO orders (customer_name, customer_phone, customer_email, delivery_address, comment, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'new') RETURNING *`,
      [customer_name, customer_phone, customer_email ?? null, delivery_address ?? null, comment ?? null, Number(total_amount) ?? 0]
    )
    const order = orderRes.rows[0]
    for (const it of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
        [order.id, it.product_id, it.quantity, it.price]
      )
    }
    return NextResponse.json(order)
  } catch (e) {
    console.error("Orders POST error:", e)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}

export async function GET() {
  if (!(await checkAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const db = getDb()
    const result = await db.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Orders API error:", error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}
