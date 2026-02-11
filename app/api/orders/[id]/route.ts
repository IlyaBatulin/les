import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  try {
    const db = getDb()
    const orderRes = await db.query("SELECT * FROM orders WHERE id = $1", [id])
    const order = orderRes.rows[0]
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const itemsRes = await db.query(
      `SELECT oi.*, p.id as "product_id", p.name as "product_name", p.image_url as "product_image_url", p.price as "product_price"
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    )
    const items = itemsRes.rows.map((row: any) => ({
      id: row.id,
      order_id: row.order_id,
      product_id: row.product_id,
      quantity: row.quantity,
      price: row.price,
      product: {
        id: row.product_id,
        name: row.product_name,
        image_url: row.product_image_url,
        price: row.product_price,
      },
    }))

    return NextResponse.json({ ...order, items })
  } catch (error) {
    console.error("Order API error:", error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  try {
    const body = await request.json()
    const status = body?.status
    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "status required" }, { status: 400 })
    }
    const db = getDb()
    const r = await db.query(
      "UPDATE orders SET status = $2 WHERE id = $1 RETURNING *",
      [id, status]
    )
    if (r.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(r.rows[0])
  } catch (e) {
    console.error("Order PATCH error:", e)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  try {
    const db = getDb()
    await db.query("DELETE FROM order_items WHERE order_id = $1", [id])
    await db.query("DELETE FROM orders WHERE id = $1", [id])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Order DELETE error:", e)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}
