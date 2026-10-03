import { requireAdminSession } from "@/lib/admin-auth"
import { getDb } from "@/lib/db"
import type { Category } from "@/lib/types"
import AddCategoryForm from "@/components/admin/add-category-form"
import ProtectedRoute from "@/components/admin/protected-route"
import CategorySearch from "@/components/admin/category-search"

async function getCategories(): Promise<Category[]> {
  const result = await getDb().query("SELECT * FROM categories ORDER BY position NULLS LAST, name")
  return result.rows
}

export default async function CategoriesPage() {
  await requireAdminSession()
  const categories = await getCategories()

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Управление категориями</h1>
          <p className="text-gray-500 mt-2">Создание, редактирование и удаление категорий товаров</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Список категорий</h2>

            </div>
            <CategorySearch categories={categories} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Добавить категорию</h2>
            <AddCategoryForm categories={categories} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
