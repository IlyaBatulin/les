"use client"

import { useCart } from "@/context/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice } = useCart()

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Корзина</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="font-medium text-lg mb-2">Ваша корзина пуста</h3>
              <p className="text-gray-500 mb-4">Добавьте товары в корзину, чтобы оформить заказ</p>
              <Button onClick={() => setIsCartOpen(false)} className="bg-green-600 hover:bg-green-700" asChild>
                <Link href="/catalog">Перейти в каталог</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-start border-b border-gray-100 pb-4">
                  <div className="w-16 h-16 relative flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={item.product.image_url || "/placeholder.svg?height=100&width=100"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-500 -mt-1 -mr-1"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-gray-500">
                      {item.product.price && item.product.price > 0
                        ? `${item.product.price.toLocaleString()} ₽/${item.product.unit}`
                        : "Цена по запросу"
                      }
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-none rounded-l-md p-0"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => {
                            const value = Math.max(1, Number(e.target.value))
                            updateQuantity(item.product.id, value)
                          }}
                          className="w-14 text-center border-0 focus:ring-0 focus:outline-none text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-none rounded-r-md p-0"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <span className="font-medium text-sm">
                        {item.product.price && item.product.price > 0
                          ? `${(item.product.price * item.quantity).toLocaleString()} ₽`
                          : "Цена по запросу"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t pt-4">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Итого:</span>
                <span className="font-bold text-lg">{totalPrice && totalPrice > 0 ? totalPrice.toLocaleString() : "0"} ₽</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                  Продолжить покупки
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setIsCartOpen(false)
                    window.location.href = "/cart"
                  }}
                >
                  Оформить заказ
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
