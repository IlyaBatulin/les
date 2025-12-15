"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"

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
  const supabase = createServerSupabaseClient()
  console.log("Adding category with data:", category)

  const { data, error } = await supabase.from("categories").insert([category]).select()

  if (error) {
    console.error("Error adding category:", error)
    throw new Error(`Failed to add category: ${error.message}`)
  }

  console.log("Category added successfully:", data)
  revalidatePath("/admin/categories")
  return data
}

export async function updateCategory(category: CategoryUpdateInput) {
  const supabase = createServerSupabaseClient()
  console.log("Updating category with data:", category)

  const { data, error } = await supabase
    .from("categories")
    .update({
      name: category.name,
      description: category.description,
      parent_id: category.parent_id === null ? null : 
                (typeof category.parent_id === 'string' && category.parent_id === 'none' ? null : category.parent_id),
      image_url: category.image_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", category.id)
    .select()

  if (error) {
    console.error("Error updating category:", error)
    throw new Error(`Failed to update category: ${error.message}`)
  }

  console.log("Category updated successfully:", data)
  revalidatePath("/admin/categories")
  return data
}

export async function deleteCategory(categoryId: number) {
  const supabase = createServerSupabaseClient()

  // First, recursively delete all subcategories
  await deleteSubcategories(categoryId)

  // Then delete the category itself
  const { error } = await supabase.from("categories").delete().eq("id", categoryId)

  if (error) {
    console.error("Error deleting category:", error)
    throw new Error("Failed to delete category")
  }

  revalidatePath("/admin/categories")
}

async function deleteSubcategories(parentId: number) {
  const supabase = createServerSupabaseClient()

  // Get all subcategories
  const { data: subcategories, error: fetchError } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", parentId)

  if (fetchError) {
    console.error("Error fetching subcategories:", fetchError)
    return
  }

  // Recursively delete each subcategory
  for (const subcategory of subcategories || []) {
    await deleteSubcategories(subcategory.id)
  }

  // Delete all products in this category
  await supabase.from("products").delete().eq("category_id", parentId)

  // Delete the subcategories of this parent
  if (subcategories && subcategories.length > 0) {
    await supabase
      .from("categories")
      .delete()
      .in(
        "id",
        subcategories.map((c) => c.id),
      )
  }
}
