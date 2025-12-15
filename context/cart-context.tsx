"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface CartProduct {
  id: number
  name: string
  price: number
  image_url: string | null
  unit: string
  category_id: number
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: CartProduct, quantity?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Загружаем корзину из localStorage при инициализации
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Ошибка при загрузке корзины:", error)
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  // Добавление товара в корзину
  const addToCart = (product: CartProduct, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id)

      if (existingItem) {
        // Если товар уже в корзине, увеличиваем количество
        return prevItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        // Если товара нет в корзине, добавляем его
        return [...prevItems, { product, quantity }]
      }
    })

    // Открываем корзину при добавлении товара
    setIsCartOpen(true)
  }

  // Удаление товара из корзины
  const removeFromCart = (productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
  }

  // Обновление количества товара
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  // Очистка корзины
  const clearCart = () => {
    setItems([])
  }

  // Подсчет общего количества товаров
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  // Подсчет общей стоимости
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
