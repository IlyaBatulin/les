import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"

export const runtime = "nodejs"

async function deleteSubcategoriesRecursive(db: ReturnType<typeof getDb>, parentId: number) {
  const subRes = await db.query("SELECT id FROM categories WHERE parent_id = $1", [parentId])
  for (const row of subRes.rows) {
    await deleteSubcategoriesRecursive(db, row.id)
  }
  await db.query("DELETE FROM products WHERE category_id = $1", [parentId])
  await db.query("DELETE FROM categories WHERE parent_id = $1", [parentId])
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
    const { name, description, parent_id, image_url } = body
    const db = getDb()
    const r = await db.query(
      `UPDATE categories SET name = COALESCE($2, name), description = $3, parent_id = $4, image_url = $5, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, name?.trim(), description ?? null, parent_id ?? null, image_url ?? null]
    )
    if (r.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(r.rows[0])
  } catch (e) {
    console.error("Category PATCH error:", e)
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
    await deleteSubcategoriesRecursive(db, Number(id))
    await db.query("DELETE FROM categories WHERE id = $1", [id])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Category DELETE error:", e)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}
