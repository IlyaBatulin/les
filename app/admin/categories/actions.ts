"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"

interface CategoryInput {
  name: string
  description: string | null
  parent_id: number | null
  image_url: string | null
}

interface CategoryUpdateInput extends CategoryInput {
  id: number
}

export async function addCategory(category: CategoryInput) {
  if (!(await checkAdminSession())) {
    throw new Error("Unauthorized")
  }

  const db = getDb()
  const { name, description, parent_id, image_url } = category

  if (!name || typeof name !== "string") {
    throw new Error("Название категории обязательно")
  }

  const r = await db.query(
    `INSERT INTO categories (name, description, parent_id, image_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name.trim(), description ?? null, parent_id ?? null, image_url ?? null]
  )

  revalidatePath("/admin/categories")
  return r.rows[0]
}

export async function updateCategory(category: CategoryUpdateInput) {
  if (!(await checkAdminSession())) {
    throw new Error("Unauthorized")
  }

  const db = getDb()
  const parentId =
    category.parent_id === null ||
    (typeof category.parent_id === "string" && category.parent_id === "none")
      ? null
      : category.parent_id

  const { name, description, image_url } = category

  const r = await db.query(
    `UPDATE categories
     SET name = COALESCE($2, name),
         description = $3,
         parent_id = $4,
         image_url = $5,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [category.id, name?.trim() || null, description ?? null, parentId ?? null, image_url ?? null]
  )

  if (r.rows.length === 0) {
    throw new Error("Категория не найдена")
  }

  revalidatePath("/admin/categories")
  return r.rows[0]
}

export async function deleteCategory(categoryId: number) {
  if (!(await checkAdminSession())) {
    throw new Error("Unauthorized")
  }

  const db = getDb()
  // Удаляем подкатегории и товары так же, как в API
  const deleteSubcategoriesRecursive = async (parentId: number) => {
    const subRes = await db.query("SELECT id FROM categories WHERE parent_id = $1", [parentId])
    for (const row of subRes.rows) {
      await deleteSubcategoriesRecursive(row.id)
    }
    await db.query("DELETE FROM products WHERE category_id = $1", [parentId])
    await db.query("DELETE FROM categories WHERE parent_id = $1", [parentId])
  }

  await deleteSubcategoriesRecursive(categoryId)
  await db.query("DELETE FROM categories WHERE id = $1", [categoryId])

  revalidatePath("/admin/categories")
}
