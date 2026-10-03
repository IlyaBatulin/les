import { getDb } from "@/lib/db"
import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Product, Category } from "@/lib/types"

export async function getProductWithRelated(id: string) {
  if (process.env.NODE_ENV === "development" && process.env.CATALOG_PREVIEW === "1" && process.env.CATALOG_PREVIEW_DATA_DIR) {
    const read = async (file: string) => JSON.parse((await readFile(path.join(process.env.CATALOG_PREVIEW_DATA_DIR!, file), "utf8")).replace(/^\uFEFF/, ""))
    const products: Product[] = await read("live-products.json")
    const categories: Category[] = await read("live-categories.json")
    const product = products.find(p => String(p.id) === id)
    if (!product) return null
    const breadcrumbs: { id: number; name: string }[] = []
    let category = categories.find(c => c.id === product.category_id)
    while (category) {
      breadcrumbs.unshift({ id: category.id, name: category.name })
      const parentId = category.parent_id
      category = categories.find(c => c.id === parentId)
    }
    return { product, breadcrumbs, relatedProducts: products.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 4) }
  }
  const db = getDb()
  const r = await db.query(
    `SELECT p.*, json_build_object('id', c.id, 'name', c.name, 'parent_id', c.parent_id) AS category
     FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1`,
    [id]
  )
  const product = r.rows[0]
  if (!product) return null

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

  let relatedProducts: { id: number; name: string; price: number; image_url: string | null; unit: string }[] = []
  if (product.category_id) {
    const rel = await db.query(
      `SELECT p.id, p.name, p.price, p.image_url, p.unit
       FROM products p WHERE p.category_id = $1 AND p.id != $2 LIMIT 4`,
      [product.category_id, id]
    )
    relatedProducts = rel.rows
  }

  return { product, breadcrumbs, relatedProducts }
}
