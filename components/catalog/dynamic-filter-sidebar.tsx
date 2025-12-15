"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { FilterOptions } from "@/lib/types"
import { createClientSupabaseClient } from "@/lib/supabase"

interface DynamicFilterSidebarProps {
  onFilterChange: (filters: FilterOptions) => void
  initialFilters: FilterOptions
  selectedCategoryId?: string | null
  categoryNames?: Record<string, string>
  hideTitle?: boolean
}

export default function DynamicFilterSidebar({
  onFilterChange,
  initialFilters,
  selectedCategoryId,
  categoryNames = {},
  hideTitle = false
}: DynamicFilterSidebarProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [characteristicFilters, setCharacteristicFilters] = useState<Record<string, string[]>>({})
  const [availableCharacteristics, setAvailableCharacteristics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Получаем характеристики товаров в зависимости от выбранной категории
  useEffect(() => {
    const fetchCharacteristics = async () => {
      setIsLoading(true)
      const supabase = createClientSupabaseClient()

      // Если выбрана категория, получаем все её подкатегории
      let categoryIds: number[] = []
      if (selectedCategoryId) {
        const allCategoryIds = await getAllSubcategoryIds(Number(selectedCategoryId))
        categoryIds = [...allCategoryIds, Number(selectedCategoryId)]
      }

      // Получаем товары с учетом выбранной категории
      let productsQuery = supabase.from("products").select("characteristics")

      if (categoryIds.length > 0) {
        productsQuery = productsQuery.in("category_id", categoryIds)
      }

      const { data: products } = await productsQuery

      // Извлекаем уникальные ключи и значения характеристик
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

      // Преобразуем Set в массивы
      const characteristicsFilters: Record<string, string[]> = {}
      Object.entries(characteristicsMap).forEach(([key, valueSet]) => {
        const arr = Array.from(valueSet)
        
        // Специальная сортировка для толщины (числовая)
        if (key === "Толщина") {
          arr.sort((a, b) => {
            // Извлекаем числовое значение из строки типа "24 мм"
            const numA = parseFloat(a.replace(/[^\d.,]/g, "").replace(",", "."))
            const numB = parseFloat(b.replace(/[^\d.,]/g, "").replace(",", "."))
            return numA - numB
          })
        } else {
        // Проверяем, все ли значения числа
        const allNumbers = arr.every(v => /^-?\d+(\.\d+)?$/.test(v))
        if (allNumbers) {
          arr.sort((a, b) => Number(a) - Number(b))
        } else {
          arr.sort()
          }
        }
        characteristicsFilters[key] = arr
      })

      setAvailableCharacteristics(Array.from(characteristicKeys).sort())
      setCharacteristicFilters(characteristicsFilters)
      setIsLoading(false)
    }

    fetchCharacteristics()
  }, [selectedCategoryId])

  // Обновляем фильтры при изменении initialFilters
  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  // Обработка изменения фильтров
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

  // Сброс всех фильтров кроме категории
  const clearFilters = () => {
    const categoryFilter = filters.categories || []
    const emptyFilters: FilterOptions = {
      categories: categoryFilter,
      ...Object.fromEntries(availableCharacteristics.map((key) => [key, []])),
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = Object.entries(filters).some(([key, values]) => key !== "categories" && values.length > 0)

  return (
    <div className="space-y-6">
      {!hideTitle && <h2 className="text-xl font-semibold">Фильтры</h2>}

      <div className="flex justify-between items-center">
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm text-gray-500">
            Сбросить все
          </Button>
        )}
      </div>

      {/* Активные фильтры */}
      {hasActiveFilters && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Активные фильтры</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).flatMap(([key, values]) =>
              key !== "categories" && values.length > 0
                ? values.map((value) => (
                    <Badge key={`${key}-${value}`} className="bg-green-600 hover:bg-green-700">
                      {formatKey(key)}: {value}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 text-white"
                        onClick={() => handleFilterChange(key, value)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                : [],
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-4 text-center text-gray-500">Загрузка фильтров...</div>
      ) : (
        <Accordion type="multiple" className="w-full space-y-2">
          {/* Фильтры по характеристикам */}
          {availableCharacteristics.map((charKey) => (
            <AccordionItem key={charKey} value={charKey}>
              <AccordionTrigger className="text-sm font-medium py-2">{formatKey(charKey)}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 mt-2">
                  {characteristicFilters[charKey]?.map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${charKey}-${value}`}
                        checked={filters[charKey]?.includes(value) || false}
                        onCheckedChange={() => handleFilterChange(charKey, value)}
                      />
                      <Label htmlFor={`${charKey}-${value}`} className="text-sm">
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
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

  const directSubcategoryIds = data.map((cat) => cat.id) as number[]

  // Рекурсивно получаем подкатегории подкатегорий
  const nestedSubcategoryIds = await Promise.all(directSubcategoryIds.map((id) => getAllSubcategoryIds(id as number)))

  // Сглаживаем массив массивов
  return [...directSubcategoryIds, ...nestedSubcategoryIds.flat()]
}

// Форматирование ключей характеристик для отображения
function formatKey(key: string): string {
  try {
    // Проверяем, что key является строкой
    if (!key || typeof key !== 'string') {
      return String(key || '')
    }

    // Специальные переводы для английских ключей
    const translations: Record<string, string> = {
      'pieces_per_cubic_meter': 'Штук в м³',
      'pieces per cubic meter': 'Штук в м³',
      'grade': 'Сорт',
      'drying': 'Сушка',
      'wood_type': 'Порода',
      'size': 'Размер',
      'standard': 'Стандарт',
      'thickness': 'Толщина',
      'width': 'Ширина',
      'length': 'Длина',
      'moisture': 'Влажность',
      'surface_treatment': 'Обработка поверхности',
      'purpose': 'Назначение'
    }

    // Проверяем точное совпадение
    if (translations[key.toLowerCase()]) {
      return translations[key.toLowerCase()]
    }

    // Проверяем совпадение с заменой подчеркиваний
    const normalizedKey = key.replace(/_/g, " ").toLowerCase()
    if (translations[normalizedKey]) {
      return translations[normalizedKey]
    }

    // Если нет перевода, форматируем как обычно
    return key
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  } catch (error) {
    console.error('Ошибка в formatKey:', error, 'key:', key)
    return String(key || '')
  }
}
