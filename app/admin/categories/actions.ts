"use server"

import { revalidatePath } from "next/cache"
import { adminFetch } from "@/lib/admin-fetch"

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
  const res = await adminFetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to add category")
  }
  revalidatePath("/admin/categories")
  return res.json()
}

export async function updateCategory(category: CategoryUpdateInput) {
  const parentId =
    category.parent_id === null ||
    (typeof category.parent_id === "string" && category.parent_id === "none")
      ? null
      : category.parent_id
  const res = await adminFetch(`/api/categories/${category.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...category, parent_id: parentId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to update category")
  }
  revalidatePath("/admin/categories")
  return res.json()
}

export async function deleteCategory(categoryId: number) {
  const res = await adminFetch(`/api/categories/${categoryId}`, { method: "DELETE" })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to delete category")
  }
  revalidatePath("/admin/categories")
}
