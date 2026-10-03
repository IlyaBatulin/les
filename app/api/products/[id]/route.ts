import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"


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
    const visited = new Set<number>()
  while (catId && !visited.has(catId)) {
    visited.add(catId)
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


import { editProduct, removeProduct } from "@/lib/admin-catalog"
import { authorizeAdminRequest, adminErrorResponse } from "@/lib/admin-http"
import { revalidateCatalog } from "@/lib/revalidate-catalog"
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request)
  if (denied) return denied
  try {
    const result = await editProduct((await params).id, await request.json())
    revalidateCatalog()
    return NextResponse.json(result)
  } catch (error) { return adminErrorResponse(error) }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request)
  if (denied) return denied
  try {
    await removeProduct((await params).id)
    revalidateCatalog()
    return NextResponse.json({ ok: true })
  } catch (error) { return adminErrorResponse(error) }
}
