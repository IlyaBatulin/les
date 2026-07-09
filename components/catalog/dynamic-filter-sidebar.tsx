"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, SlidersHorizontal } from "lucide-react"
import type { FilterOptions } from "@/lib/types"
import { effectiveCharacteristics } from "@/lib/characteristics"

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
      try {
        const params = new URLSearchParams()
        if (selectedCategoryId) {
          // API сам разворачивает подкатегории
          params.append("category", selectedCategoryId)
        }
        const res = await fetch(`/api/products?${params.toString()}`)
        const products = res.ok ? await res.json() : []

        // Извлекаем уникальные КАНОНИЧЕСКИЕ ключи и значения характеристик.
        // Ключи: «thickness» / «Толщина» объединяются в один фильтр.
        // Значения: дедупликация без учёта регистра («свежий лес» = «Свежий лес»),
        // предпочитаем вариант с заглавной буквы.
        const characteristicsMap: Record<string, Map<string, string>> = {}

        products?.forEach((product: { name?: string; characteristics?: Record<string, unknown> }) => {
          const normalized = effectiveCharacteristics(product)
          Object.entries(normalized).forEach(([key, value]) => {
            if (!characteristicsMap[key]) {
              characteristicsMap[key] = new Map()
            }
            const valueKey = value.toLowerCase()
            const existing = characteristicsMap[key].get(valueKey)
            if (!existing || (existing[0] !== existing[0].toUpperCase() && value[0] === value[0].toUpperCase())) {
              characteristicsMap[key].set(valueKey, value)
            }
          })
        })

        // Преобразуем в отсортированные массивы
        const characteristicsFilters: Record<string, string[]> = {}
        Object.entries(characteristicsMap).forEach(([key, valueMap]) => {
          const arr = Array.from(valueMap.values())
          // Числовая сортировка, если значения содержат числа («24 мм», «2.5»)
          const nums = arr.map((v) => parseFloat(v.replace(/[^\d.,-]/g, "").replace(",", ".")))
          const allNumeric = nums.every((n) => !Number.isNaN(n))
          if (allNumeric) {
            arr.sort((a, b) => {
              const numA = parseFloat(a.replace(/[^\d.,-]/g, "").replace(",", "."))
              const numB = parseFloat(b.replace(/[^\d.,-]/g, "").replace(",", "."))
              return numA - numB
            })
          } else {
            arr.sort((a, b) => a.localeCompare(b, "ru"))
          }
          characteristicsFilters[key] = arr
        })

        // Показываем только фильтры, где есть из чего выбирать (2+ значений)
        const keys = Object.keys(characteristicsFilters)
          .filter((k) => characteristicsFilters[k].length >= 2)
          .sort((a, b) => a.localeCompare(b, "ru"))

        setAvailableCharacteristics(keys)
        setCharacteristicFilters(characteristicsFilters)
      } catch (e) {
        console.error("Ошибка загрузки фильтров:", e)
      } finally {
        setIsLoading(false)
      }
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

  // Количество выбранных значений по ключу
  const selectedCount = (key: string) => filters[key]?.length || 0

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = Object.entries(filters).some(([key, values]) => key !== "categories" && values.length > 0)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
      {!hideTitle && (
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <SlidersHorizontal className="h-4 w-4 text-green-600" />
            Фильтры
          </h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs text-gray-500 hover:text-red-600"
            >
              Сбросить
            </Button>
          )}
        </div>
      )}

      {/* Активные фильтры */}
      {hasActiveFilters && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(filters).flatMap(([key, values]) =>
              key !== "categories" && values.length > 0
                ? values.map((value) => (
                    <Badge
                      key={`${key}-${value}`}
                      className="gap-1 bg-green-600 pr-1 text-xs font-normal hover:bg-green-700"
                    >
                      {value}
                      <button
                        type="button"
                        aria-label={`Убрать фильтр ${value}`}
                        className="rounded-full p-0.5 hover:bg-green-800"
                        onClick={() => handleFilterChange(key, value)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                : [],
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 py-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      ) : availableCharacteristics.length === 0 ? (
        <p className="py-2 text-sm text-gray-400">Для этой категории нет фильтров</p>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={availableCharacteristics.slice(0, 3)}
          className="w-full"
        >
          {availableCharacteristics.map((charKey) => (
            <AccordionItem key={charKey} value={charKey} className="border-gray-100">
              <AccordionTrigger className="py-2.5 text-sm font-medium hover:text-green-700 hover:no-underline">
                <span className="flex items-center gap-2">
                  {charKey}
                  {selectedCount(charKey) > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1.5 text-[11px] font-semibold text-white">
                      {selectedCount(charKey)}
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                  {characteristicFilters[charKey]?.map((value) => (
                    <label
                      key={value}
                      htmlFor={`${charKey}-${value}`}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-green-50"
                    >
                      <Checkbox
                        id={`${charKey}-${value}`}
                        checked={filters[charKey]?.includes(value) || false}
                        onCheckedChange={() => handleFilterChange(charKey, value)}
                        className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
                      />
                      <span className="select-none text-sm text-gray-700">{value}</span>
                    </label>
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
