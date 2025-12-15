"use client"

import { useMemo } from "react"
import { Product, Category } from "@/lib/types"

// ID категорий пиломатериалов
const LUMBER_CATEGORY_IDS = [93, 94, 95, 96, 67, 56, 57, 58, 59, 60, 61, 62, 27]

/**
 * Хук для определения принадлежности товара к категории пиломатериалов
 */
export function useLumberCategory() {
  /**
   * Проверяет, является ли категория пиломатериалами или их подкатегорией
   * @param category - категория для проверки
   * @returns true, если категория относится к пиломатериалам
   */
  const isLumberCategory = useMemo(() => {
    return (category: Category): boolean => {
      try {
        if (!category || typeof category !== 'object') {
          return false
        }
        
        // Если это категория пиломатериалов
        if (category.id && LUMBER_CATEGORY_IDS.includes(category.id)) {
          return true
        }
        
        // Если это подкатегория пиломатериалов
        if (category.parent_id && LUMBER_CATEGORY_IDS.includes(category.parent_id)) {
          return true
        }
        
        return false
      } catch (error) {
        console.error('Ошибка в isLumberCategory:', error, 'category:', category)
        return false
      }
    }
  }, [])

  /**
   * Проверяет, относится ли товар к категории пиломатериалов
   * @param product - товар для проверки
   * @returns true, если товар относится к пиломатериалам
   */
  const isLumberProduct = useMemo(() => {
    return (product: Product): boolean => {
      try {
        if (!product || typeof product !== 'object') {
          return false
        }

        // Проверяем, входит ли категория товара в список пиломатериалов
        if (product.category_id && LUMBER_CATEGORY_IDS.includes(product.category_id)) {
          return true
        }
        
        // Проверка через объект категории, если он есть
        if (product.category) {
          if (isLumberCategory(product.category)) return true
        }

        // Дополнительная эвристика по названию
        const name = (product.name || "").toLowerCase()
        const lumberKeywords = ["доска", "брус", "брусок", "рейка", "вагонка", "строганая", "обрезная", "погонаж"]
        if (lumberKeywords.some(k => name.includes(k))) return true

        return false
      } catch (error) {
        console.error('Ошибка в isLumberProduct:', error, 'product:', product)
        return false
      }
    }
  }, [isLumberCategory])

  /**
   * Проверяет, поддерживает ли товар цену за куб
   * @param product - товар для проверки
   * @returns true, если товар поддерживает цену за куб
   */
  const supportsCubicPricing = useMemo(() => {
    return (product: Product): boolean => {
      return isLumberProduct(product) && product.price_per_cubic != null && product.price_per_cubic > 0
    }
  }, [isLumberProduct])

  return {
    isLumberProduct,
    isLumberCategory,
    supportsCubicPricing,
    LUMBER_CATEGORY_IDS
  }
}
