"use client"

import { useMemo, useCallback } from "react"
import { Product } from "@/lib/types"
import { PriceUnit } from "@/components/lumber-price-toggle"

/**
 * Стандартные размеры для расчета объема пиломатериалов
 */
interface LumberDimensions {
  /** Толщина в мм */
  thickness: number
  /** Ширина в мм */
  width: number
  /** Длина в мм */
  length: number
}

/**
 * Хук для расчета цены пиломатериалов в зависимости от единицы измерения
 */
export function useLumberPriceCalculation() {
  const parseNumber = useCallback((value: unknown): number | null => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null
    }

    if (typeof value === "string") {
      const normalized = value.replace(",", ".").match(/\d+(?:\.\d+)?/)
      if (!normalized) return null

      const parsed = Number(normalized[0])
      return Number.isFinite(parsed) ? parsed : null
    }

    return null
  }, [])

  /**
   * Извлекает размеры из названия товара
   * Ожидает формат: "Фанера ФК 10 мм 1525×1525" или "Доска 25×150×6000"
   */
  const extractDimensionsFromName = useCallback((productName: string): LumberDimensions | null => {
    // Паттерны для разных форматов
    const patterns = [
      // Для фанеры: "Фанера ФК 10 мм 1525×1525"
      /(\d+)\s*мм\s+(\d+)\s*[×xх]\s*(\d+)/i,
      // Для досок: "Доска 25×150×6000"
      /(\d+)\s*[×xх]\s*(\d+)\s*[×xх]\s*(\d+)/i,
      // Для брусков: "Брусок 50×50×3000"
      /(\d+)\s*[×xх]\s*(\d+)\s*[×xх]\s*(\d+)/i
    ]

    for (const pattern of patterns) {
      const match = productName.match(pattern)
      if (match) {
        if (pattern === patterns[0]) {
          // Фанера: толщина в мм, размеры листа
          return {
            thickness: parseInt(match[1]),
            width: parseInt(match[2]),
            length: parseInt(match[3])
          }
        } else {
          // Пиломатериалы: толщина × ширина × длина
          return {
            thickness: parseInt(match[1]),
            width: parseInt(match[2]),
            length: parseInt(match[3])
          }
        }
      }
    }

    return null
  }, [])

  /**
   * Извлекает размеры из характеристик товара
   */
  const extractDimensionsFromCharacteristics = useCallback((characteristics: Record<string, any>): LumberDimensions | null => {
    const getCharacteristic = (keys: string[]) => {
      const entries = Object.entries(characteristics || {})
      const found = entries.find(([key]) => keys.includes(key.toLowerCase()))
      return found?.[1]
    }

    const piecesPerCubicMeter = parseNumber(getCharacteristic([
      "pieces_per_cubic_meter",
      "pieces per cubic meter",
      "штук в м³",
      "штук в м3",
    ]))

    if (piecesPerCubicMeter && piecesPerCubicMeter > 0) {
      const side = Math.cbrt(1 / piecesPerCubicMeter) * 1000
      return {
        thickness: side,
        width: side,
        length: side
      }
    }

    const thickness = getCharacteristic(["толщина", "thickness"])
    const width = getCharacteristic(["ширина", "width"])
    const length = getCharacteristic(["длина", "length"])
    const size = getCharacteristic(["размер", "size", "dimensions"])

    const thicknessValue = parseNumber(thickness)
    const widthValue = parseNumber(width)
    const lengthValue = parseNumber(length)

    if (thicknessValue && widthValue && lengthValue) {
      return {
        thickness: thicknessValue,
        width: widthValue,
        length: lengthValue
      }
    }

    if (thickness && size) {
      // Извлекаем числовое значение толщины
      const thicknessValue = parseNumber(thickness)

      // Извлекаем размеры из строки типа "1525×1525" или "1525x1525"
      const sizeMatch = typeof size === "string" 
        ? size.match(/(\d+)\s*[×xх]\s*(\d+)/i)
        : null

      if (sizeMatch && thicknessValue) {
        return {
          thickness: thicknessValue,
          width: parseInt(sizeMatch[1]),
          length: parseInt(sizeMatch[2])
        }
      }
    }

    if (typeof size === "string") {
      const fullSizeMatch = size.match(/(\d+)\s*[×xх]\s*(\d+)\s*[×xх]\s*(\d+)/i)

      if (fullSizeMatch) {
        return {
          thickness: parseInt(fullSizeMatch[1]),
          width: parseInt(fullSizeMatch[2]),
          length: parseInt(fullSizeMatch[3])
        }
      }
    }

    return null
  }, [parseNumber])

  /**
   * Вычисляет объем в кубических метрах на основе размеров
   */
  const calculateVolume = useCallback((dimensions: LumberDimensions): number => {
    // Переводим из мм в метры и вычисляем объем
    const volumeM3 = (dimensions.thickness / 1000) * (dimensions.width / 1000) * (dimensions.length / 1000)
    return volumeM3
  }, [])

  /**
   * Получает цену товара в зависимости от выбранной единицы измерения
   */
  const getPrice = useCallback((product: Product, unit: PriceUnit): { price: number; displayUnit: string } | null => {
    try {
      if (!product || typeof product !== 'object') {
        return null
      }

      const piecePrice = parseNumber(product.price)
      const cubicPrice = parseNumber(product.price_per_cubic)

      // Попытка извлечь размеры для конверсии
      const dimensionsFromName = extractDimensionsFromName(product.name || '')
      const dimensionsFromChar = extractDimensionsFromCharacteristics(product.characteristics || {})
      const dimensions = dimensionsFromName || dimensionsFromChar

      if (unit === "piece") {
        if (piecePrice && piecePrice > 0) {
          return { price: piecePrice, displayUnit: "шт" }
        }

        // Если цены за штуку нет, но есть цена за куб и размеры — конвертируем
        if (cubicPrice && cubicPrice > 0 && dimensions) {
          const volume = calculateVolume(dimensions)
          const calculatedPiecePrice = cubicPrice * volume
          return { price: calculatedPiecePrice, displayUnit: "шт" }
        }

        return null
      }

      if (unit === "cubic") {
        if (cubicPrice && cubicPrice > 0) {
          return { price: cubicPrice, displayUnit: "м³" }
        }

        // Если цены за куб нет, но есть цена за штуку и размеры — конвертируем
        if (piecePrice && piecePrice > 0 && dimensions) {
          const volume = calculateVolume(dimensions)
          if (volume > 0) {
            const calculatedCubicPrice = piecePrice / volume
            return { price: calculatedCubicPrice, displayUnit: "м³" }
          }
        }

        return null
      }

      return null
    } catch (error) {
      console.error('Ошибка в getPrice:', error, 'product:', product, 'unit:', unit)
      return null
    }
  }, [parseNumber, extractDimensionsFromName, extractDimensionsFromCharacteristics, calculateVolume])

  /**
   * Конвертирует цену между единицами измерения
   */
  const convertPrice = useCallback((
    product: Product, 
    fromUnit: PriceUnit, 
    toUnit: PriceUnit
  ): number | null => {
    if (fromUnit === toUnit) {
      return fromUnit === "piece" ? product.price : product.price_per_cubic
    }

    // Получаем размеры товара
    const dimensionsFromName = extractDimensionsFromName(product.name)
    const dimensionsFromChar = extractDimensionsFromCharacteristics(product.characteristics || {})
    const dimensions = dimensionsFromName || dimensionsFromChar

    if (!dimensions) {
      return null
    }

    const volume = calculateVolume(dimensions)

    if (fromUnit === "piece" && toUnit === "cubic") {
      // Конвертируем из цены за штуку в цену за куб
      return product.price / volume
    }

    if (fromUnit === "cubic" && toUnit === "piece") {
      // Конвертируем из цены за куб в цену за штуку
      return (product.price_per_cubic || 0) * volume
    }

    return null
  }, [extractDimensionsFromName, extractDimensionsFromCharacteristics, calculateVolume])

  /**
   * Форматирует цену для отображения
   */
  const formatPrice = useCallback((price: number | null, unit: string): string => {
    if (!price || price <= 0) {
      return "Цена по запросу"
    }
    return `${price.toLocaleString("ru-RU")} ₽/${unit}`
  }, [])

  return {
    extractDimensionsFromName,
    extractDimensionsFromCharacteristics,
    calculateVolume,
    getPrice,
    convertPrice,
    formatPrice
  }
}
