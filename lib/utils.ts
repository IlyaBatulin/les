import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Вспомогательная функция для форматирования ключей характеристик
export function formatCharacteristicKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Вспомогательная функция для форматирования значений характеристик
export function formatCharacteristicValue(value: any): string {
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return value.join(", ")
    } else {
      return Object.entries(value)
        .map(([k, v]) => `${formatCharacteristicKey(k)}: ${v}`)
        .join(", ")
    }
  }
  return String(value)
}

// Функция для группировки характеристик по категориям
export function groupCharacteristics(characteristics: Record<string, any>): Record<string, Record<string, any>> {
  const groups: Record<string, Record<string, any>> = {
    dimensions: {},
    material: {},
    technical: {},
    other: {},
  }

  // Определяем к какой группе относится каждая характеристика
  Object.entries(characteristics).forEach(([key, value]) => {
    if (["width", "height", "length", "thickness", "diameter", "size"].includes(key)) {
      groups.dimensions[key] = value
    } else if (["material", "wood_type", "color", "finish", "coating"].includes(key)) {
      groups.material[key] = value
    } else if (["power", "voltage", "weight", "capacity", "speed", "pressure"].includes(key)) {
      groups.technical[key] = value
    } else {
      groups.other[key] = value
    }
  })

  // Удаляем пустые группы
  return Object.fromEntries(Object.entries(groups).filter(([_, values]) => Object.keys(values).length > 0))
}
