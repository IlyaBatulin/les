import { requireAdminSession } from "@/lib/admin-auth"
export const dynamic = 'force-dynamic'

import { getDb } from "@/lib/db"
import type { Category } from "@/lib/types"
import AddProductForm from "@/components/admin/add-product-form"
import ProtectedRoute from "@/components/admin/protected-route"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

async function getCategories(): Promise<Category[]> {
  const result = await getDb().query("SELECT * FROM categories ORDER BY position NULLS LAST, name")
  return result.rows
}

export default async function AddProductPage() {
  await requireAdminSession()
  const categories = await getCategories()

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Добавить товар</h1>
        </div>

        <div className="max-w-3xl">
          <AddProductForm categories={categories} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
