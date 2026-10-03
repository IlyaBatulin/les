import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"
import { authorizeAdminRequest, adminErrorResponse } from "@/lib/admin-http"
import { positiveId, orderStatusSchema, validated } from "@/lib/admin-validation"
import { removeOrder } from "@/lib/admin-catalog"
import { revalidatePath } from "next/cache"

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request)
  if (denied) return denied
  try {
    const id = positiveId((await params).id)
    const status = validated(orderStatusSchema, (await request.json()).status)
    const result = await getDb().query("UPDATE orders SET status=$2 WHERE id=$1 RETURNING *", [id, status])
    if (!result.rows.length) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${id}`)
    return NextResponse.json(result.rows[0])
  } catch (error) { return adminErrorResponse(error) }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request)
  if (denied) return denied
  try {
    await removeOrder((await params).id)
    revalidatePath("/admin/orders")
    revalidatePath("/admin")
    return NextResponse.json({ ok: true })
  } catch (error) { return adminErrorResponse(error) }
}
