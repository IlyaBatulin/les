export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from "@/lib/supabase"
import type { Product } from "@/lib/types"
import ProductList from "@/components/admin/product-list"
import ProtectedRoute from "@/components/admin/protected-route"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

async function getProducts(): Promise<Product[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(id, name)
    `)
    .order("name")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Управление товарами</h1>
            <p className="text-gray-500 mt-2">Просмотр, добавление, редактирование и удаление товаров</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/admin/products/add">
              <Plus className="mr-2 h-4 w-4" /> Добавить товар
            </Link>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Поиск товаров..." className="pl-8" id="product-search" />
        </div>

        <ProductList products={products} />
      </div>
    </ProtectedRoute>
  )
}
