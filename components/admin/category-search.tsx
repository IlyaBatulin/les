"use client"

import { useState, useEffect } from "react"
import type { Category } from "@/lib/types"
import CategoryList from "./category-list"

interface CategorySearchProps {
  categories: Category[]
}

export default function CategorySearch({ categories }: CategorySearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories)

  // Обработка поиска
  useEffect(() => {
    const searchInput = document.getElementById("category-search") as HTMLInputElement
    if (searchInput) {
      const handleSearch = () => {
        setSearchTerm(searchInput.value)
      }

      searchInput.addEventListener("input", handleSearch)
      return () => {
        searchInput.removeEventListener("input", handleSearch)
      }
    }
  }, [])

  // Фильтрация категорий
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCategories(categories)
      return
    }

    const lowerSearchTerm = searchTerm.toLowerCase()
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(lowerSearchTerm) ||
        category.description?.toLowerCase().includes(lowerSearchTerm),
    )

    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  return (
    <div className="space-y-4">
      {searchTerm && <div className="text-sm text-gray-500">Найдено категорий: {filteredCategories.length}</div>}
      <CategoryList categories={filteredCategories} />
    </div>
  )
}
