"use client"

import { useState } from "react"
import type { Category } from "@/lib/types"
import CategoryList from "./category-list"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface CategorySearchProps {
  categories: Category[]
}

export default function CategorySearch({ categories }: CategorySearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const term = searchTerm.trim().toLowerCase()
  const filteredCategories = categories.filter(category => category.name.toLowerCase().includes(term) || category.description?.toLowerCase().includes(term))

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input aria-label="Поиск категорий" type="search" placeholder="Поиск категорий..." className="pl-8" id="category-search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
      </div>
      {searchTerm && <div className="text-sm text-gray-500">Найдено категорий: {filteredCategories.length}</div>}
      <CategoryList categories={categories} searchTerm={searchTerm} />
    </div>
  )
}
