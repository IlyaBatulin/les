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
    const { name, description, parent_id, image_url } = body
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name required" }, { status: 400 })
    }
    const db = getDb()
    const r = await db.query(
      `INSERT INTO categories (name, description, parent_id, image_url) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), description ?? null, parent_id ?? null, image_url ?? null]
    )
    return NextResponse.json(r.rows[0])
  } catch (e) {
    console.error("Categories POST error:", e)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const queryIndex = request.url.indexOf("?")
  const searchParams = new URLSearchParams(queryIndex >= 0 ? request.url.slice(queryIndex + 1) : "")
  const parent = searchParams.get("parent")
  const id = searchParams.get("id")
  const pathFor = searchParams.get("pathFor")
  const descendantIdsOf = searchParams.get("descendantIdsOf")
  const flat = searchParams.get("flat") === "1"

  const db = getDb()

  try {
    // ID всех потомков категории (рекурсивно)
    if (descendantIdsOf) {
      const ids: number[] = []
      let current = [Number(descendantIdsOf)]
      while (current.length > 0) {
        const placeholders = current.map((_, i) => `$${i + 1}`).join(",")
        const r = await db.query(
          `SELECT id FROM categories WHERE parent_id IN (${placeholders})`,
          current
        )
        const next = r.rows.map((row) => row.id)
        ids.push(...next)
        current = next
      }
      return NextResponse.json(ids)
    }

    // Путь категории для хлебных крошек (от листа к корню)
    if (pathFor) {
      const path: { id: number; name: string }[] = []
      let currentId: number | null = Number(pathFor)
      while (currentId) {
        const r = await db.query("SELECT id, name, parent_id FROM categories WHERE id = $1", [currentId])
        const row = r.rows[0]
        if (!row) break
        path.unshift({ id: row.id, name: row.name })
        currentId = row.parent_id
      }
      return NextResponse.json(path)
    }

    // Одна категория по id (для каталога — путь, имя и т.д.)
    if (id) {
      const result = await db.query(
        `SELECT c.*, 
          (SELECT json_agg(child ORDER BY child.position NULLS LAST, child.name)
           FROM categories child WHERE child.parent_id = c.id) AS subcategories
         FROM categories c
         WHERE c.id = $1`,
        [id]
      )
      const row = result.rows[0]
      if (!row) {
        return NextResponse.json(null, { status: 404 })
      }
      const category = {
        ...row,
        subcategories: row.subcategories || [],
      }
      return NextResponse.json(category)
    }

    // Корневые категории (parent=null)
    if (parent === "null" || parent === "") {
      const result = await db.query(
        `SELECT * FROM categories 
         WHERE parent_id IS NULL 
         ORDER BY position NULLS LAST, name`
      )
      return NextResponse.json(result.rows)
    }

    // Дочерние категории (parent=X)
    if (parent) {
      const result = await db.query(
        `SELECT * FROM categories 
         WHERE parent_id = $1 
         ORDER BY position NULLS LAST, name`,
        [parent]
      )
      return NextResponse.json(result.rows)
    }

    // flat=1: все категории плоским списком (для админки)
    if (flat) {
      const result = await db.query(
        `SELECT * FROM categories ORDER BY name`
      )
      return NextResponse.json(result.rows)
    }

    // По умолчанию: полное дерево (для nav)
    const result = await db.query(
      `SELECT * FROM categories ORDER BY position NULLS LAST, name`
    )
    const data = result.rows

    const rootCategories: any[] = []
    const categoryMap = new Map()

    data.forEach((category: any) => {
      categoryMap.set(category.id, { ...category, subcategories: [] })
    })

    data.forEach((category: any) => {
      const categoryWithSubs = categoryMap.get(category.id)
      if (category.parent_id === null) {
        rootCategories.push(categoryWithSubs)
      } else {
        const parentCategory = categoryMap.get(category.parent_id)
        if (parentCategory) {
          parentCategory.subcategories.push(categoryWithSubs)
        }
      }
    })

    return NextResponse.json(rootCategories)
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Categories API error:", err.message)
    console.error("  code:", (error as NodeJS.ErrnoException)?.code)
    console.error("  cause:", (error as { cause?: unknown })?.cause)
    console.error("  stack:", err.stack)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
