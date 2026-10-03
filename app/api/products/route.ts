import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { createProduct } from "@/lib/admin-catalog"
import { authorizeAdminRequest, adminErrorResponse } from "@/lib/admin-http"
import { revalidateCatalog } from "@/lib/revalidate-catalog"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const denied = await authorizeAdminRequest(request)
  if (denied) return denied
  try {
    const result = await createProduct(await request.json())
    revalidateCatalog()
    return NextResponse.json(result, { status: 201 })
  } catch (error) { return adminErrorResponse(error) }
}

export async function GET(request: Request) {
  const queryIndex = request.url.indexOf("?")
  const searchParams = new URLSearchParams(queryIndex >= 0 ? request.url.slice(queryIndex + 1) : "")
  const categoryIds = searchParams.getAll("category")
  const woodTypes = searchParams.getAll("woodType")
  const thicknesses = searchParams.getAll("thickness")
  const widths = searchParams.getAll("width")
  const lengths = searchParams.getAll("length")
  const grades = searchParams.getAll("grade")
  const moistures = searchParams.getAll("moisture")
  const surfaceTreatments = searchParams.getAll("surfaceTreatment")
  const purposes = searchParams.getAll("purpose")
  const search = searchParams.get("search")
  const sort = searchParams.get("sort") || "default"
  const limitParam = searchParams.get("limit")
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 8)) : null

  try {
  const db = getDb()

  const conditions: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  // Category filter (including subcategories)
  if (categoryIds.length > 0) {
    const allCategoryIds: number[] = []
    for (const catId of categoryIds) {
      const id = Number.parseInt(catId, 10)
      if (!Number.isNaN(id)) {
        const subIds = await getAllSubcategoryIds(db, id)
        allCategoryIds.push(id, ...subIds)
      }
    }
    const unique = [...new Set(allCategoryIds)]
    if (unique.length > 0) {
      conditions.push(`p.category_id = ANY($${paramIndex}::int[])`)
      values.push(unique)
      paramIndex++
    }
  }

  if (woodTypes.length > 0) {
    conditions.push(`p.wood_type = ANY($${paramIndex}::text[])`)
    values.push(woodTypes)
    paramIndex++
  }
  if (thicknesses.length > 0) {
    conditions.push(`p.thickness = ANY($${paramIndex}::text[])`)
    values.push(thicknesses)
    paramIndex++
  }
  if (widths.length > 0) {
    conditions.push(`p.width = ANY($${paramIndex}::text[])`)
    values.push(widths)
    paramIndex++
  }
  if (lengths.length > 0) {
    conditions.push(`p.length = ANY($${paramIndex}::text[])`)
    values.push(lengths)
    paramIndex++
  }
  if (grades.length > 0) {
    conditions.push(`p.grade = ANY($${paramIndex}::text[])`)
    values.push(grades)
    paramIndex++
  }
  if (moistures.length > 0) {
    conditions.push(`p.moisture = ANY($${paramIndex}::text[])`)
    values.push(moistures)
    paramIndex++
  }
  if (surfaceTreatments.length > 0) {
    conditions.push(`p.surface_treatment = ANY($${paramIndex}::text[])`)
    values.push(surfaceTreatments)
    paramIndex++
  }
  if (purposes.length > 0) {
    conditions.push(`p.purpose = ANY($${paramIndex}::text[])`)
    values.push(purposes)
    paramIndex++
  }
  if (search) {
    conditions.push(`p.name ILIKE $${paramIndex}`)
    values.push(`%${search}%`)
    paramIndex++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  const orderBy = (() => {
    switch (sort) {
      case "price-asc": return "p.price ASC"
      case "price-desc": return "p.price DESC"
      case "name-asc": return "p.name ASC"
      case "name-desc": return "p.name DESC"
      case "created-desc": return "p.created_at DESC NULLS LAST"
      case "views-desc": return "p.views DESC NULLS LAST"
      default: return "p.name ASC"
    }
  })()

  const limitClause = limit != null ? `LIMIT ${limit}` : ""
  const sql = `
    SELECT p.*,
           json_build_object('id', c.id, 'name', c.name) AS category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY ${orderBy}
    ${limitClause}
  `

    const result = await db.query(sql, values)
    return NextResponse.json(result.rows)
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Products API error:", err.message)
    console.error("  code:", (error as NodeJS.ErrnoException)?.code)
    console.error("  cause:", (error as { cause?: unknown })?.cause)
    console.error("  stack:", err.stack)
    return NextResponse.json(
      { error: "Не удалось загрузить каталог" },
      { status: 500 }
    )
  }
}

async function getAllSubcategoryIds(db: { query: (sql: string, params?: unknown[]) => Promise<{ rows: { id: number }[] }> }, categoryId: number): Promise<number[]> {
  const result = await db.query(`WITH RECURSIVE tree AS (
    SELECT id FROM categories WHERE id=$1
    UNION SELECT c.id FROM categories c JOIN tree t ON c.parent_id=t.id
  ) SELECT id FROM tree WHERE id != $1`, [categoryId])
  return result.rows.map(row => row.id)
}
