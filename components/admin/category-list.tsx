"use client"

import { useState } from "react"
import type { Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Edit, Trash } from "lucide-react"
import { deleteCategory } from "@/app/admin/categories/actions"
import EditCategoryDialog from "./edit-category-dialog"

interface CategoryListProps {
  categories: Category[]
  level?: number
  searchTerm?: string
}

export default function CategoryList({ categories, level = 0, searchTerm = "" }: CategoryListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const toggleExpand = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleDelete = async (categoryId: number) => {
    if (confirm("Вы уверены, что хотите удалить эту категорию? Все связанные товары также будут удалены.")) {
      try { await deleteCategory(categoryId) } catch (error) { alert(error instanceof Error ? error.message : "Не удалось удалить категорию") }
    }
  }

  if (categories.length === 0) {
    return <p className="text-gray-500">Нет категорий</p>
  }

  // Функция для построения дерева категорий
  const buildCategoryTree = (cats: Category[], parentId: number | null = null): Category[] => {
    return cats
      .filter((cat) => cat.parent_id === parentId)
      .map((cat) => ({
        ...cat,
        subcategories: buildCategoryTree(cats, cat.id),
      }))
  }

  // Строим дерево категорий
  const term = searchTerm.trim().toLowerCase()
  const categoryTree = term ? categories.filter(category => category.name.toLowerCase().includes(term) || category.description?.toLowerCase().includes(term)).map(category => ({ ...category, subcategories: [] })) : buildCategoryTree(categories)

  // Рекурсивная функция для отображения дерева категорий
  const renderCategoryTree = (cats: Category[], currentLevel = 0) => {
    return (
      <div className="space-y-2">
        {cats.map((category) => (
          <div key={category.id} className="border rounded-md">
            <div
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
              style={{ paddingLeft: `${currentLevel * 16 + 12}px` }}
            >
              <div className="flex items-center gap-2">
                {category.subcategories && category.subcategories.length > 0 ? (
                  <button onClick={() => toggleExpand(category.id)} className="p-1 rounded-full hover:bg-gray-200">
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <div className="w-6" />
                )}
                <span className="font-medium">{category.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button aria-label={`Редактировать ${category.name}`} variant="ghost" size="icon" onClick={() => setEditingCategory(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button aria-label={`Удалить ${category.name}`} variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {expandedCategories.has(category.id) && category.subcategories && category.subcategories.length > 0 && (
              <div className="pl-4 py-1">{renderCategoryTree(category.subcategories, currentLevel + 1)}</div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {renderCategoryTree(categoryTree)}

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          categories={categories}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </>
  )
}
