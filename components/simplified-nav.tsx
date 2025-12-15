"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, ChevronRight } from "lucide-react"
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

export function SimplifiedNav() {
  const [rootCategories, setRootCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClientSupabaseClient()

        // Проверяем соединение с Supabase
        const { error: healthCheckError } = await supabase
          .from("categories")
          .select("count", { count: "exact", head: true })

        if (healthCheckError) {
          console.error("Ошибка соединения с Supabase:", healthCheckError)
          setError("Не удалось подключиться к базе данных")
          setIsLoading(false)
          return
        }

        // Получаем все категории
        const { data, error } = await supabase.from("categories").select("*").order("name")

        if (error) {
          console.error("Ошибка при загрузке категорий:", error)
          setError("Не удалось загрузить категории")
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

        setRootCategories(rootCategories)
      } catch (err) {
        console.error("Непредвиденная ошибка при загрузке категорий:", err)
        setError("Произошла ошибка при загрузке категорий")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <nav className="hidden md:flex items-center space-x-6">
      <div className="relative group">
        <button
          className={cn(
            "flex items-center gap-1 py-2 text-white hover:text-gray-200 transition-colors",
            isOpen && "text-gray-200",
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          Каталог
          <ChevronDown className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full z-50 w-screen max-w-screen-md bg-white shadow-lg rounded-md overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6">
              {isLoading ? (
                <div className="col-span-3 flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="col-span-3 text-center py-8 text-red-500">
                  <p>{error}</p>
                  <p className="text-sm mt-2">Пожалуйста, попробуйте позже</p>
                </div>
              ) : rootCategories.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  <p>Категории не найдены</p>
                </div>
              ) : (
                rootCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/catalog?category=${category.id}`}
                    className="group flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="h-12 w-12 relative flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={category.image_url || "/placeholder.svg?height=100&width=100"}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors flex items-center">
                        {category.name}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <ChevronRight className="h-4 w-4 ml-1" />
                        )}
                      </h4>
                      {category.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">Просмотрите все категории нашего каталога</p>
              <Link
                href="/catalog"
                className="text-sm font-medium text-green-600 hover:text-green-700"
                onClick={() => setIsOpen(false)}
              >
                Все категории
              </Link>
            </div>
          </div>
        )}
      </div>

      <Link href="/contacts" className="text-white hover:text-gray-200 transition-colors">
        Контакты
      </Link>
    </nav>
  )
}
