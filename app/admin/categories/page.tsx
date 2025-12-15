import { createServerSupabaseClient } from "@/lib/supabase"
import type { Category } from "@/lib/types"
import AddCategoryForm from "@/components/admin/add-category-form"
import ProtectedRoute from "@/components/admin/protected-route"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import CategorySearch from "@/components/admin/category-search"

async function getCategories(): Promise<Category[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

export default async function CategoriesPage() {
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
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input type="search" placeholder="Поиск категорий..." className="pl-8" id="category-search" />
              </div>
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
