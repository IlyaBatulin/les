"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductCharacteristicsProps {
  characteristics: Record<string, any>
  className?: string
}

export function ProductCharacteristics({ characteristics, className }: ProductCharacteristicsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Проверяем, что characteristics существует и является объектом
  if (!characteristics || typeof characteristics !== 'object') {
    return null
  }

  // Фильтруем и сортируем характеристики для отображения
  const displayCharacteristics = Object.entries(characteristics).filter(
    ([key, value]) => value !== null && value !== "",
  )

  // Определяем, сколько характеристик показывать в свернутом состоянии
  const initialDisplayCount = 4
  const hasMoreToShow = displayCharacteristics.length > initialDisplayCount

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-medium text-lg">Характеристики</h3>
      <div className="space-y-1">
        {displayCharacteristics
          .slice(0, isExpanded ? displayCharacteristics.length : initialDisplayCount)
          .map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 py-1 border-b border-gray-100">
              <span className="text-gray-600 capitalize">{formatKey(key)}</span>
              <span className="font-medium">{formatValue(value)}</span>
            </div>
          ))}
      </div>

      {hasMoreToShow && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 mt-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" /> Свернуть
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" /> Показать все характеристики
            </>
          )}
        </Button>
      )}
    </div>
  )
}

// Вспомогательные функции для форматирования ключей и значений
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

function formatValue(value: any): string {
  try {
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        return value.join(", ")
      } else {
        return Object.entries(value)
          .map(([k, v]) => `${formatKey(k)}: ${v}`)
          .join(", ")
      }
    }
    return String(value || '')
  } catch (error) {
    console.error('Ошибка в formatValue:', error, 'value:', value)
    return String(value || '')
  }
}
