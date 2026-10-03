import { requireAdminSession } from "@/lib/admin-auth"
export const dynamic = 'force-dynamic'

import { getDb } from "@/lib/db"
import type { Product } from "@/lib/types"
import ProductList from "@/components/admin/product-list"
import ProtectedRoute from "@/components/admin/protected-route"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

async function getProducts(): Promise<Product[]> {
  const result = await getDb().query("SELECT p.*, json_build_object('id',c.id,'name',c.name) AS category FROM products p LEFT JOIN categories c ON c.id=p.category_id ORDER BY p.id DESC")
  return result.rows
}

export default async function ProductsPage() {
  await requireAdminSession()
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



        <ProductList products={products} />
      </div>
    </ProtectedRoute>
  )
}
