import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const url = new URL(request.url)
  const relatedLimit = Math.min(4, Math.max(0, parseInt(url.searchParams.get("related") || "0", 10)))
  try {
    const db = getDb()
    const r = await db.query(
      `SELECT p.*, json_build_object('id', c.id, 'name', c.name, 'parent_id', c.parent_id) AS category
       FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1`,
      [id]
    )
    const product = r.rows[0]
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const breadcrumbs: { id: number; name: string }[] = []
    let catId: number | null = product.category_id
    while (catId) {
      const cr = await db.query("SELECT id, name, parent_id FROM categories WHERE id = $1", [catId])
      const row = cr.rows[0]
      if (!row) break
      breadcrumbs.unshift({ id: row.id, name: row.name })
      catId = row.parent_id
    }

    const response: Record<string, unknown> = { ...product, breadcrumbs }

    if (product.category_id && relatedLimit > 0) {
      const rel = await db.query(
        `SELECT p.id, p.name, p.price, p.image_url, p.unit
         FROM products p WHERE p.category_id = $1 AND p.id != $2 LIMIT $3`,
        [product.category_id, id, relatedLimit]
      )
      response.relatedProducts = rel.rows
    } else {
      response.relatedProducts = []
    }

    return NextResponse.json(response)
  } catch (e) {
    console.error("Product GET error:", e)
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
    const db = getDb()
    const fields = ["name", "description", "price", "price_per_cubic", "image_url", "category_id", "unit", "stock", "characteristics"]
    const updates: string[] = []
    const values: unknown[] = []
    let i = 1
    for (const f of fields) {
      if (f in body) {
        if (f === "characteristics") {
          updates.push(`${f} = $${i}::jsonb`)
          values.push(JSON.stringify(body[f] || {}))
        } else {
          updates.push(`${f} = $${i}`)
          values.push(body[f])
        }
        i++
      }
    }
    if (updates.length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    updates.push("updated_at = NOW()")
    values.push(id)
    const r = await db.query(
      `UPDATE products SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    )
    if (r.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(r.rows[0])
  } catch (e) {
    console.error("Product PATCH error:", e)
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
    const r = await db.query("DELETE FROM products WHERE id = $1 RETURNING id", [id])
    if (r.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Product DELETE error:", e)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}
