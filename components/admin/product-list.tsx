"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Edit, Trash, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { deleteProduct } from "@/app/admin/products/actions"
import EditProductDialog from "./edit-product-dialog"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)

  // Обработка поиска
  useEffect(() => {
    const searchInput = document.getElementById("product-search") as HTMLInputElement
    if (searchInput) {
      const handleSearch = () => {
        setSearchTerm(searchInput.value)
        setCurrentPage(1) // Сбрасываем на первую страницу при поиске
      }

      searchInput.addEventListener("input", handleSearch)
      return () => {
        searchInput.removeEventListener("input", handleSearch)
      }
    }
  }, [])

  // Фильтрация и пагинация
  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerSearchTerm) ||
          product.description?.toLowerCase().includes(lowerSearchTerm) ||
          product.category?.name.toLowerCase().includes(lowerSearchTerm),
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm])

  const handleDelete = async (productId: number) => {
    if (confirm("Вы уверены, что хотите удалить этот товар?")) {
      await deleteProduct(productId)
    }
  }

  const toggleProductExpand = (productId: number) => {
    setExpandedProduct(expandedProduct === productId ? null : productId)
  }

  // Пагинация
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  // Функция для отображения основных характеристик товара
  const renderMainCharacteristics = (product: Product) => {
    if (!product.characteristics) return null

    const characteristics = product.characteristics as Record<string, any>
    const mainCharacteristics = []

    // Приоритетные характеристики для отображения
    const priorityKeys = ["wood_type", "thickness", "width", "length", "power", "weight", "color"]

    for (const key of priorityKeys) {
      if (characteristics[key]) {
        mainCharacteristics.push({
          key: formatKey(key),
          value: characteristics[key],
        })
      }

      // Показываем максимум 3 характеристики
      if (mainCharacteristics.length >= 3) break
    }

    if (mainCharacteristics.length === 0) return null

    return (
      <div className="mt-2 space-y-1">
        {mainCharacteristics.map((char, index) => (
          <p key={index} className="text-xs text-gray-500">
            <span className="font-medium">{char.key}:</span> {char.value}
          </p>
        ))}
      </div>
    )
  }

  // Функция для отображения всех характеристик товара
  const renderAllCharacteristics = (product: Product) => {
    if (!product.characteristics) return null

    const characteristics = product.characteristics as Record<string, any>
    const characteristicEntries = Object.entries(characteristics).filter(([_, value]) => value !== null && value !== "")

    if (characteristicEntries.length === 0) return null

    return (
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
        {characteristicEntries.map(([key, value]) => (
          <div key={key} className="text-xs">
            <span className="font-medium text-gray-700">{formatKey(key)}:</span>{" "}
            <span className="text-gray-600">{formatValue(value)}</span>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return <p className="text-gray-500">Нет товаров</p>
  }

  return (
    <div className="space-y-4">
      {/* Информация о результатах поиска */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          {searchTerm ? (
            <span>Найдено товаров: {filteredProducts.length}</span>
          ) : (
            <span>Всего товаров: {products.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Показывать по:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number.parseInt(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Список товаров */}
      {paginatedProducts.length === 0 ? (
        <p className="text-gray-500">Товары не найдены</p>
      ) : (
        paginatedProducts.map((product) => (
          <div key={product.id} className="border rounded-md p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-100 relative flex-shrink-0">
                {product.image_url ? (
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Нет фото</div>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-medium">{product.name}</h3>
                  <div className="flex items-start gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleProductExpand(product.id)}
                            className="h-8 w-8"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Показать характеристики</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)} className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-gray-50">
                    {product.category?.name || "Без категории"}
                  </Badge>
                  <Badge variant={product.stock > 0 ? "outline" : "destructive"} className="bg-gray-50">
                    {product.stock > 0 ? `В наличии: ${product.stock}` : "Нет в наличии"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold">{product.price} ₽</p>
                  <p className="text-sm text-gray-500">за {product.unit}</p>
                </div>

                {renderMainCharacteristics(product)}
              </div>
            </div>

            {expandedProduct === product.id && (
              <div className="mt-4 pt-3 border-t">
                <h4 className="text-sm font-medium mb-2">Все характеристики</h4>
                {renderAllCharacteristics(product)}
              </div>
            )}
          </div>
        ))
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {editingProduct && <EditProductDialog product={editingProduct} onClose={() => setEditingProduct(null)} />}
    </div>
  )
}

// Вспомогательные функции для форматирования ключей и значений
function formatKey(key: string): string {
  try {
    // Проверяем, что key является строкой
    if (!key || typeof key !== 'string') {
      return String(key || 'Неизвестно')
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
    if (value === null || value === undefined) {
      return 'Не указано'
    }
    
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        return value.join(", ")
      } else {
        return Object.entries(value)
          .map(([k, v]) => `${formatKey(k)}: ${v}`)
          .join(", ")
      }
    }
    return String(value)
  } catch (error) {
    console.error('Ошибка в formatValue:', error, 'value:', value)
    return 'Ошибка отображения'
  }
}
