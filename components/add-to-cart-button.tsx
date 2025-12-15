"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check, Plus, Minus } from "lucide-react"
import { useCart } from "@/context/cart-context"
import type { CartProduct } from "@/context/cart-context"

export interface AddToCartButtonProps {
  product: {
    id: number
    name: string
    price: number
    image_url: string | null
    unit: string
    category_id: number
  }
  onClick?: (e: React.MouseEvent) => void
  className?: string
  showQuantity?: boolean
}

export function AddToCartButton({ product, onClick, className = "", showQuantity = false }: AddToCartButtonProps) {
  const { addToCart, items, updateQuantity } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  // Проверяем, есть ли товар уже в корзине
  const existingItem = items.find((item) => item.product.id === product.id)
  const quantity = existingItem ? existingItem.quantity : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    e.stopPropagation(); // Останавливаем всплытие события
    // Разрешаем добавление даже если цена отсутствует (будет 0 => "цена уточняется")
    const safeProduct = { ...product, price: (product.price ?? 0) }
    addToCart(safeProduct)

    // Показываем индикатор успешного добавления на короткое время
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)

    // Вызываем onClick, если он передан
    if (onClick) {
      onClick(e)
    }
  }

  if (showQuantity && quantity > 0) {
    return (
      <div className={`flex items-center border border-gray-200 rounded-md ${className}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-none rounded-l-md"
          onClick={(e) => updateQuantity(product.id, quantity - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="px-3 py-1 min-w-[2.5rem] text-center">{quantity}</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-none rounded-r-md"
          onClick={(e) => updateQuantity(product.id, quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const noPrice = !product.price || product.price <= 0

  return (
    <Button onClick={handleAddToCart} className={`bg-green-600 hover:bg-green-700 ${className}`} disabled={isAdded}>
      {isAdded ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Добавлено
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />{noPrice ? "Уточнить цену" : "В корзину"}
        </>
      )}
    </Button>
  )
}
