"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"

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
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("products").insert([product])

  if (error) {
    console.error("Error adding product:", error)
    throw new Error("Failed to add product")
  }

  revalidatePath("/admin/products")
}

export async function updateProduct(product: ProductUpdateInput) {
  const supabase = createServerSupabaseClient()

  // Валидация данных
  if (!product.name || product.name.trim() === '') {
    throw new Error("Название товара не может быть пустым")
  }
  
  if (isNaN(product.price) || product.price < 0) {
    throw new Error("Цена должна быть положительным числом")
  }
  
  if (isNaN(product.category_id) || product.category_id <= 0) {
    throw new Error("Неверная категория товара")
  }
  
  if (isNaN(product.stock) || product.stock < 0) {
    throw new Error("Количество на складе не может быть отрицательным")
  }

  const updateData: any = {
    name: product.name.trim(),
    description: product.description?.trim() || null,
    price: product.price,
    image_url: product.image_url?.trim() || null,
    category_id: product.category_id,
    unit: product.unit,
    stock: product.stock,
    characteristics: product.characteristics || {},
    updated_at: new Date().toISOString(),
  }

  // Добавляем price_per_cubic только если оно определено
  if (product.price_per_cubic !== undefined && product.price_per_cubic !== null) {
    updateData.price_per_cubic = product.price_per_cubic
  }

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", product.id)

  if (error) {
    console.error("Error updating product:", error)
    throw new Error(`Ошибка при обновлении товара: ${error.message}`)
  }

  revalidatePath("/admin/products")
}

export async function deleteProduct(productId: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("products").delete().eq("id", productId)

  if (error) {
    console.error("Error deleting product:", error)
    throw new Error("Failed to delete product")
  }

  revalidatePath("/admin/products")
}
