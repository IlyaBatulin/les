"use server"

import { revalidatePath } from "next/cache"
import { adminFetch } from "@/lib/admin-fetch"

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
  const res = await adminFetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to add product")
  }
  revalidatePath("/admin/products")
}

export async function updateProduct(product: ProductUpdateInput) {
  if (!product.name?.trim()) throw new Error("Название товара не может быть пустым")
  if (isNaN(product.price) || product.price < 0) throw new Error("Цена должна быть положительным числом")
  if (isNaN(product.category_id) || product.category_id <= 0) throw new Error("Неверная категория товара")
  if (isNaN(product.stock) || product.stock < 0) throw new Error("Количество на складе не может быть отрицательным")

  const body: Record<string, unknown> = {
    name: product.name.trim(),
    description: product.description?.trim() || null,
    price: product.price,
    image_url: product.image_url?.trim() || null,
    category_id: product.category_id,
    unit: product.unit,
    stock: product.stock,
    characteristics: product.characteristics || {},
  }
  if (product.price_per_cubic !== undefined && product.price_per_cubic !== null) {
    body.price_per_cubic = product.price_per_cubic
  }

  const res = await adminFetch(`/api/products/${product.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Ошибка при обновлении товара")
  }
  revalidatePath("/admin/products")
}

export async function deleteProduct(productId: number) {
  const res = await adminFetch(`/api/products/${productId}`, { method: "DELETE" })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to delete product")
  }
  revalidatePath("/admin/products")
}
