import { getDb } from "@/lib/db"
import type { PoolClient } from "pg"
import { AdminError, categorySchema, positiveId, productSchema, validated } from "@/lib/admin-validation"

async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getDb().connect()
  try {
    await client.query("BEGIN")
    const result = await work(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    if ((error as { code?: string }).code === "23503") throw new AdminError("Запись связана с другими данными. Проверьте категорию и заказы.", 409)
    throw error
  } finally { client.release() }
}
const productFields = ["name", "description", "price", "price_per_cubic", "image_url", "category_id", "unit", "stock", "characteristics"] as const
function productValues(product: ReturnType<typeof productSchema.parse>) {
  return productFields.map(key => key === "characteristics" ? JSON.stringify(product[key]) : product[key])
}
export async function createProduct(input: unknown) {
  const product = validated(productSchema, input)
  return transaction(async db => {
    const result = await db.query(`INSERT INTO products (${productFields.join(", ")}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) RETURNING *`, productValues(product))
    return result.rows[0]
  })
}
export async function editProduct(idValue: unknown, input: unknown) {
  const id = positiveId(idValue)
  const patch = validated(productSchema.partial().strict(), input)
  if (!Object.keys(patch).length) throw new AdminError("Нет полей для обновления")
  return transaction(async db => {
    const existing = await db.query("SELECT * FROM products WHERE id=$1 FOR UPDATE", [id])
    if (!existing.rows[0]) throw new AdminError("Товар не найден", 404)
    const row = existing.rows[0]
    const product = validated(productSchema, { ...row, price: Number(row.price), price_per_cubic: row.price_per_cubic == null ? null : Number(row.price_per_cubic), stock: Number(row.stock), ...patch })
    const assignments = productFields.map((field, i) => `${field}=$${i+1}${field === "characteristics" ? "::jsonb" : ""}`)
    const result = await db.query(`UPDATE products SET ${assignments.join(", ")}, updated_at=NOW() WHERE id=$10 RETURNING *`, [...productValues(product), id])
    return result.rows[0]
  })
}
export async function removeProduct(idValue: unknown) {
  const id = positiveId(idValue)
  await transaction(async db => {
    const row = await db.query("SELECT id FROM products WHERE id=$1 FOR UPDATE", [id])
    if (!row.rows.length) throw new AdminError("Товар не найден", 404)
    const orders = await db.query("SELECT 1 FROM order_items WHERE product_id=$1 LIMIT 1", [id])
    if (orders.rows.length) throw new AdminError("Товар есть в заказах. Сохраните его для истории заказов.", 409)
    await db.query("DELETE FROM products WHERE id=$1", [id])
  })
}
async function validateParent(db: PoolClient, parent: number | null, id?: number) {
  if (parent === null) return
  const ancestors = await db.query(`WITH RECURSIVE ancestors AS (
    SELECT id,parent_id FROM categories WHERE id=$1
    UNION SELECT c.id,c.parent_id FROM categories c JOIN ancestors a ON c.id=a.parent_id
  ) SELECT id FROM ancestors`, [parent])
  if (!ancestors.rows.length) throw new AdminError("Родительская категория не найдена", 409)
  if (ancestors.rows.some(row => row.id === id)) throw new AdminError("Категорию нельзя вложить в себя или своего потомка", 409)
}
export async function createCategory(input: unknown) {
  const category = validated(categorySchema, input)
  return transaction(async db => {
    await db.query("SELECT pg_advisory_xact_lock(73321001)")
    await validateParent(db, category.parent_id)
    const result = await db.query("INSERT INTO categories (name,description,parent_id,image_url) VALUES ($1,$2,$3,$4) RETURNING *", [category.name,category.description,category.parent_id,category.image_url])
    return result.rows[0]
  })
}
export async function editCategory(idValue: unknown, input: unknown) {
  const id = positiveId(idValue)
  const patch = validated(categorySchema.partial().strict(), input)
  if (!Object.keys(patch).length) throw new AdminError("Нет полей для обновления")
  return transaction(async db => {
    await db.query("SELECT pg_advisory_xact_lock(73321001)")
    const existing = await db.query("SELECT * FROM categories WHERE id=$1 FOR UPDATE", [id])
    if (!existing.rows[0]) throw new AdminError("Категория не найдена", 404)
    const category = validated(categorySchema, { ...existing.rows[0], ...patch })
    await validateParent(db, category.parent_id, id)
    const result = await db.query("UPDATE categories SET name=$2,description=$3,parent_id=$4,image_url=$5,updated_at=NOW() WHERE id=$1 RETURNING *", [id,category.name,category.description,category.parent_id,category.image_url])
    return result.rows[0]
  })
}
export async function removeCategory(idValue: unknown) {
  const id = positiveId(idValue)
  await transaction(async db => {
    await db.query("SELECT pg_advisory_xact_lock(73321001)")
    const tree = await db.query(`WITH RECURSIVE tree AS (
      SELECT id FROM categories WHERE id=$1
      UNION SELECT c.id FROM categories c JOIN tree t ON c.parent_id=t.id
    ) SELECT id FROM tree`, [id])
    if (!tree.rows.length) throw new AdminError("Категория не найдена", 404)
    const ids = tree.rows.map(row => row.id)
    await db.query("SELECT id FROM categories WHERE id=ANY($1::int[]) ORDER BY id FOR UPDATE", [ids])
    const products = await db.query("SELECT id FROM products WHERE category_id=ANY($1::int[]) ORDER BY id FOR UPDATE", [ids])
    const ordered = await db.query("SELECT 1 FROM order_items WHERE product_id=ANY($1::int[]) LIMIT 1", [products.rows.map(row => row.id)])
    if (ordered.rows.length) throw new AdminError("В этой категории есть товары из заказов. Удаление отменено, история заказов сохранена.", 409)
    await db.query("DELETE FROM products WHERE category_id=ANY($1::int[])", [ids])
    await db.query("DELETE FROM categories WHERE id=ANY($1::int[])", [ids])
  })
}
export async function removeOrder(idValue: unknown) {
  const id = positiveId(idValue)
  await transaction(async db => {
    const row = await db.query("SELECT id FROM orders WHERE id=$1 FOR UPDATE", [id])
    if (!row.rows.length) throw new AdminError("Заказ не найден", 404)
    await db.query("DELETE FROM order_items WHERE order_id=$1", [id])
    await db.query("DELETE FROM orders WHERE id=$1", [id])
  })
}
