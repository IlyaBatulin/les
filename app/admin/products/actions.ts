"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"

interface ProductInput {
  name: string
  description: string | null
  price: number
  price_per_cubic?: number | null
  image_url: string | null
  category_id: number
  unit: string
  stock: number
  characteristics: Record<string, any>
}

interface ProductUpdateInput extends ProductInput {
  id: number
}

export async function addProduct(product: ProductInput) {
  if (!(await checkAdminSession())) {
    throw new Error("Unauthorized")
  }

  const db = getDb()
  const { name, description, price, price_per_cubic, image_url, category_id, unit, stock, characteristics } = product

  if (!name || typeof name !== "string" || category_id == null) {
    throw new Error("Название и категория обязательны")
  }

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

  revalidatePath("/admin/products")
  return r.rows[0]
}

export async function updateProduct(product: ProductUpdateInput) {
  if (!product.name?.trim()) throw new Error("Название товара не может быть пустым")
  if (isNaN(product.price) || product.price < 0) throw new Error("Цена должна быть положительным числом")
  if (isNaN(product.category_id) || product.category_id <= 0) throw new Error("Неверная категория товара")
  if (isNaN(product.stock) || product.stock < 0) throw new Error("Количество на складе не может быть отрицательным")

  if (!(await checkAdminSession())) {
    throw new Error("Unauthorized")
  }

  const db = getDb()
  const fields = [
    "name",
    "description",
    "price",
    "price_per_cubic",
    "image_url",
    "category_id",
    "unit",
    "stock",
    "characteristics",
  ]
  const updates: string[] = []
  const values: unknown[] = []
  let i = 1

  const body: Record<string, unknown> = {
    name: product.name.trim(),
    description: product.description?.trim() || null,
    price: product.price,
    price_per_cubic: product.price_per_cubic ?? null,
    image_url: product.image_url?.trim() || null,
    category_id: product.category_id,
    unit: product.unit,
    stock: product.stock,
    characteristics: product.characteristics || {},
  }

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

  if (updates.length === 0) {
    throw new Error("Нет полей для обновления")
  }

  updates.push("updated_at = NOW()")
  values.push(product.id)

  const r = await db.query(
    `UPDATE products SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  )
  if (r.rows.length === 0) {
    throw new Error("Товар не найден")
  }

  revalidatePath("/admin/products")
  return r.rows[0]
}

export async function deleteProduct(productId: number) {
  if (!(await checkAdminSession())) {
    throw new Error("Unauthorized")
  }

  const db = getDb()
  const r = await db.query("DELETE FROM products WHERE id = $1 RETURNING id", [productId])
  if (r.rows.length === 0) {
    throw new Error("Товар не найден")
  }

  revalidatePath("/admin/products")
}
