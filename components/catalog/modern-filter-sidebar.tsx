"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FilterOptions } from "@/lib/types"
import { createClientSupabaseClient } from "@/lib/supabase"
import { X } from "lucide-react"

interface ModernFilterSidebarProps {
  onFilterChange: (filters: FilterOptions) => void
  initialFilters: FilterOptions
  selectedCategoryId?: string | null
}

export default function ModernFilterSidebar({
  onFilterChange,
  initialFilters,
  selectedCategoryId,
}: ModernFilterSidebarProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as { id: string; name: string }[],
    woodTypes: [] as string[],
    thicknesses: [] as string[],
    widths: [] as string[],
    lengths: [] as string[],
    grades: [] as string[],
    moistures: [] as string[],
    surfaceTreatments: [] as string[],
    purposes: [] as string[],
  })

  // Добавим новые состояния в начале компонента, после существующих filterOptions
  const [characteristicFilters, setCharacteristicFilters] = useState<Record<string, string[]>>({})
  const [availableCharacteristics, setAvailableCharacteristics] = useState<string[]>([])

  // Заменим функцию useEffect для fetchFilterOptions на следующую:
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const supabase = createClientSupabaseClient()

      // Fetch categories
      const { data: categories } = await supabase.from("categories").select("id, name").order("name")

      // Fetch all products to extract characteristics, filtered by category if specified
      let productsQuery = supabase.from("products").select("characteristics, category_id")

      // Если выбрана категория, получаем все товары из этой категории и её подкатегорий
      if (selectedCategoryId) {
        // Сначала получаем все подкатегории выбранной категории
        const allCategoryIds = await getAllSubcategoryIds(Number(selectedCategoryId))
        // Добавляем саму выбранную категорию
        allCategoryIds.push(Number(selectedCategoryId))
        // Фильтруем товары по всем этим категориям
        productsQuery = productsQuery.in("category_id", allCategoryIds)
      }

      const { data: products } = await productsQuery

      // Extract unique characteristic keys and values
      const characteristicsMap: Record<string, Set<string>> = {}
      const characteristicKeys = new Set<string>()

      products?.forEach((product) => {
        if (product.characteristics && typeof product.characteristics === "object") {
          Object.entries(product.characteristics).forEach(([key, value]) => {
            if (value !== null && value !== "") {
              characteristicKeys.add(key)

              if (!characteristicsMap[key]) {
                characteristicsMap[key] = new Set()
              }
              characteristicsMap[key].add(String(value))
            }
          })
        }
      })

      // Convert Sets to Arrays
      const characteristicsFilters: Record<string, string[]> = {}
      Object.entries(characteristicsMap).forEach(([key, valueSet]) => {
        const values = Array.from(valueSet)
        
        // Специальная сортировка для толщины (числовая)
        if (key === "Толщина") {
          characteristicsFilters[key] = values.sort((a, b) => {
            // Извлекаем числовое значение из строки типа "24 мм"
            const numA = parseFloat(a.replace(/[^\d.,]/g, "").replace(",", "."))
            const numB = parseFloat(b.replace(/[^\d.,]/g, "").replace(",", "."))
            return numA - numB
          })
        } else {
          characteristicsFilters[key] = values.sort()
        }
      })

      setAvailableCharacteristics(Array.from(characteristicKeys).sort())
      setCharacteristicFilters(characteristicsFilters)

      setFilterOptions({
        categories: categories?.map((cat) => ({ id: cat.id.toString(), name: cat.name })) || [],
        woodTypes: [],
        thicknesses: [],
        widths: [],
        lengths: [],
        grades: [],
        moistures: [],
        surfaceTreatments: [],
        purposes: [],
      })
    }

    fetchFilterOptions()
  }, [selectedCategoryId])

  // Заменим функцию handleFilterChange на следующую, чтобы она поддерживала характеристики:
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }

      // Проверяем, существует ли такой тип фильтра
      if (!newFilters[filterType]) {
        newFilters[filterType] = []
      }

      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter((item) => item !== value)
      } else {
        newFilters[filterType] = [...newFilters[filterType], value]
      }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  // Заменим функцию clearFilters на следующую:
  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      categories: [],
      ...Object.fromEntries(availableCharacteristics.map((key) => [key, []])),
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  // Заменим функцию renderFilterSection на следующую:
  const renderFilterSection = (
    title: string,
    filterType: string,
    options: string[] | { id: string; name: string }[],
  ) => {
    if (options.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const value = typeof option === "string" ? option : option.id
            const label = typeof option === "string" ? option : option.name
            const isSelected = filters[filterType]?.includes(value) || false

            return (
              <Badge
                key={value}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer ${isSelected ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}`}
                onClick={() => handleFilterChange(filterType, value)}
              >
                {label}
                {isSelected && <X className="ml-1 h-3 w-3" />}
              </Badge>
            )
          })}
        </div>
      </div>
    )
  }

  const hasActiveFilters = Object.values(filters).some((filterArray) => filterArray.length > 0)

  // Заменим return блок на следующий, чтобы добавить отображение характеристик:
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm text-gray-500">
            Сбросить все
          </Button>
        )}
      </div>

      {renderFilterSection("Категории", "categories", filterOptions.categories)}

      {/* Характеристики товаров */}
      {availableCharacteristics.map((charKey) => {
        // Форматируем название характеристики для отображения
        const formattedTitle = charKey
          .replace(/_/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        return renderFilterSection(formattedTitle, charKey, characteristicFilters[charKey] || [])
      })}
    </div>
  )
}

// Вспомогательная функция для получения всех ID подкатегорий
async function getAllSubcategoryIds(categoryId: number): Promise<number[]> {
  const supabase = createClientSupabaseClient()

  const { data, error } = await supabase.from("categories").select("id").eq("parent_id", categoryId)

  if (error || !data || data.length === 0) {
    return []
  }

  const directSubcategoryIds = data.map((cat) => cat.id)

  // Рекурсивно получаем подкатегории подкатегорий
  const nestedSubcategoryIds = await Promise.all(directSubcategoryIds.map((id) => getAllSubcategoryIds(id)))

  // Сглаживаем массив массивов
  return [...directSubcategoryIds, ...nestedSubcategoryIds.flat()]
}
