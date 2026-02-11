import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!(await checkAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { name, description, price, price_per_cubic, image_url, category_id, unit, stock, characteristics } = body
    if (!name || typeof name !== "string" || category_id == null) {
      return NextResponse.json({ error: "name and category_id required" }, { status: 400 })
    }
    const db = getDb()
    const r = await db.query(
      `INSERT INTO products (name, description, price, price_per_cubic, image_url, category_id, unit, stock, characteristics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb) RETURNING *`,
      [
        name.trim(),
        description ?? null,
        Number(price) ?? 0,
        price_per_cubic ?? null,
        image_url ?? null,
        Number(category_id),
        unit ?? "шт",
        Number(stock) ?? 0,
        JSON.stringify(characteristics || {}),
      ]
    )
    return NextResponse.json(r.rows[0])
  } catch (e) {
    console.error("Products POST error:", e)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
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

  try {
    const result = await db.query(sql, values)
    return NextResponse.json(result.rows)
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Products API error:", err.message)
    console.error("  code:", (error as NodeJS.ErrnoException)?.code)
    console.error("  cause:", (error as { cause?: unknown })?.cause)
    console.error("  stack:", err.stack)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

async function getAllSubcategoryIds(db: { query: (sql: string, params?: unknown[]) => Promise<{ rows: { id: number }[] }> }, categoryId: number): Promise<number[]> {
  const result = await db.query("SELECT id FROM categories WHERE parent_id = $1", [categoryId])
  if (!result.rows || result.rows.length === 0) return []
  const ids = result.rows.map((r) => r.id)
  const nested = await Promise.all(ids.map((id) => getAllSubcategoryIds(db, id)))
  return [...ids, ...nested.flat()]
}
