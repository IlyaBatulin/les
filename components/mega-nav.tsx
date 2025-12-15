"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface Category {
  id: number
  name: string
  description: string | null
  parent_id: number | null
  image_url: string | null
  subcategories?: Category[]
}

export function MegaNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      const supabase = createClientSupabaseClient()

      // Получаем все категории
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) {
        console.error("Ошибка при загрузке категорий:", error)
        setIsLoading(false)
        return
      }

      // Организуем категории в иерархическую структуру
      const rootCategories: Category[] = []
      const categoryMap = new Map<number, Category>()

      // Первый проход: создаем карту всех категорий
      data.forEach((category: Category) => {
        categoryMap.set(category.id, { ...category, subcategories: [] })
      })

      // Второй проход: строим иерархию
      data.forEach((category: Category) => {
        const categoryWithSubs = categoryMap.get(category.id)!

        if (category.parent_id === null) {
          rootCategories.push(categoryWithSubs)
        } else {
          const parentCategory = categoryMap.get(category.parent_id)
          if (parentCategory) {
            if (!parentCategory.subcategories) {
              parentCategory.subcategories = []
            }
            parentCategory.subcategories.push(categoryWithSubs)
          }
        }
      })

      setCategories(rootCategories)
      setIsLoading(false)
    }

    fetchCategories()
  }, [])

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {isLoading ? (
        <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
      ) : (
        <>
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative group"
              onMouseEnter={() => setActiveCategory(category.id)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <button
                className={cn(
                  "flex items-center gap-1 py-2 text-white hover:text-gray-200 transition-colors",
                  activeCategory === category.id && "text-gray-200",
                )}
              >
                {category.name}
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Мега-меню */}
              {activeCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                <div className="absolute left-0 top-full z-50 w-screen max-w-screen-md bg-white shadow-lg rounded-md overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 p-6">
                    <div className="col-span-1">
                      <div className="aspect-square relative rounded-md overflow-hidden">
                        <Image
                          src={category.image_url || "/placeholder.svg?height=300&width=300"}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-4">
                        <h3 className="font-medium text-lg text-gray-900">{category.name}</h3>
                        {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
                      </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/catalog?category=${subcategory.id}`}
                          className="group flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="h-12 w-12 relative flex-shrink-0 rounded overflow-hidden">
                            <Image
                              src={subcategory.image_url || "/placeholder.svg?height=100&width=100"}
                              alt={subcategory.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                              {subcategory.name}
                            </h4>
                            {subcategory.description && (
                              <p className="text-xs text-gray-500 line-clamp-2">{subcategory.description}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Найдите все товары в категории <span className="font-medium">{category.name}</span>
                    </p>
                    <Link
                      href={`/catalog?category=${category.id}`}
                      className="text-sm font-medium text-green-600 hover:text-green-700"
                    >
                      Смотреть все
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link href="/contacts" className="text-white hover:text-gray-200 transition-colors">
            Контакты
          </Link>
        </>
      )}
    </nav>
  )
}
