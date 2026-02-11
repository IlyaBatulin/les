"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FilterOptions } from "@/lib/types"
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

  useEffect(() => {
    const fetchFilterOptions = async () => {
      let categoryIds: number[] = []
      if (selectedCategoryId) {
        const res = await fetch(`/api/categories?descendantIdsOf=${selectedCategoryId}`)
        const ids = res.ok ? await res.json() : []
        categoryIds = [Number(selectedCategoryId), ...ids]
      }

      const params = new URLSearchParams()
      params.set("limit", "500")
      categoryIds.forEach((c) => params.append("category", String(c)))
      const prodRes = await fetch(`/api/products?${params.toString()}`)
      const products = prodRes.ok ? await prodRes.json() : []

      const catRes = await fetch("/api/categories?flat=1")
      const categories = catRes.ok ? await catRes.json() : []

      const characteristicsMap: Record<string, Set<string>> = {}
      const characteristicKeys = new Set<string>()

      products?.forEach((product: { characteristics?: Record<string, unknown> }) => {
        if (product.characteristics && typeof product.characteristics === "object") {
          Object.entries(product.characteristics).forEach(([key, value]) => {
            if (value !== null && value !== "") {
              characteristicKeys.add(key)
              if (!characteristicsMap[key]) characteristicsMap[key] = new Set()
              characteristicsMap[key].add(String(value))
            }
          })
        }
      })

      const characteristicsFilters: Record<string, string[]> = {}
      Object.entries(characteristicsMap).forEach(([key, valueSet]) => {
        const values = Array.from(valueSet)
        if (key === "Толщина") {
          characteristicsFilters[key] = values.sort((a, b) => {
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
        categories: (categories || []).map((c: { id: number; name: string }) => ({ id: String(c.id), name: c.name })),
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
