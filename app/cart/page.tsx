"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, ShoppingBag, Plus, Minus, ArrowLeft, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [comment, setComment] = useState("")
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consent, setConsent] = useState(false)
  const { toast } = useToast()

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !phone) {
      toast({
        title: "Ошибка оформления заказа",
        description: "Пожалуйста, заполните обязательные поля",
        variant: "destructive",
      })
      return
    }

    if (!consent) {
      toast({
        title: "Ошибка оформления заказа",
        description: "Необходимо согласие на обработку персональных данных",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClientSupabaseClient()

      // Проверяем существование продуктов перед созданием заказа
      if (items.length === 0) {
        throw new Error("Корзина пуста")
      }

      // Проверяем, что все товары существуют в базе данных
      const productIds = items.map(item => item.product.id)
      const { data: existingProducts, error: productsError } = await supabase
        .from("products")
        .select("id")
        .in("id", productIds)
      
      if (productsError) {
        throw new Error(productsError.message)
      }
      
      // Проверяем, все ли товары найдены
      if (!existingProducts || existingProducts.length !== productIds.length) {
        throw new Error("Некоторые товары в корзине недоступны. Пожалуйста, обновите страницу.")
      }

      // Создаем заказ в базе данных
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: name,
          customer_phone: phone,
          customer_email: email || null,
          delivery_address: address || null,
          comment: comment || null,
          total_amount: totalPrice,
          status: "new",
        })
        .select()

      if (orderError) {
        throw new Error(orderError.message)
      }

      // Получаем ID созданного заказа
      const orderId = order[0].id

      // Добавляем товары заказа
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Ошибка при добавлении товаров заказа:", itemsError)
        
        // Удаляем заказ, чтобы не оставлять пустые заказы в базе
        await supabase.from("orders").delete().eq("id", orderId as string)
        
        throw new Error("Ошибка при оформлении заказа: " + itemsError.message)
      }

      // Показываем сообщение об успехе
      toast({
        title: "Заказ успешно оформлен",
        description: "Наш менеджер свяжется с вами в ближайшее время",
      })

      // Показываем страницу успешного оформления заказа
      setOrderPlaced(true)
      clearCart()
      
      // Отправляем уведомление о заказе на email
      try {
        await fetch('/api/email/send-order-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderDetails: {
              orderId: order[0].id,
              customerName: name,
              customerPhone: phone,
              customerEmail: email || null,
              deliveryAddress: address || null,
              comment: comment || null,
              totalAmount: totalPrice,
              items: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
              })),
            }
          }),
        });
      } catch (emailError) {
        // Просто логируем ошибку, но не прерываем оформление заказа
        console.error('Ошибка при отправке уведомления о заказе:', emailError);
      }
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error)
      toast({
        title: "Ошибка оформления заказа",
        description: error instanceof Error ? error.message : "Пожалуйста, попробуйте еще раз позже",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Ваш заказ принят!</h1>
          <p className="text-lg mb-6">
            Спасибо за ваш заказ. Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа и уточнения
            деталей доставки.
          </p>
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
            <Link href="/">Вернуться на главную</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="flex justify-center mb-4">
          <ShoppingBag className="h-16 w-16 text-gray-300" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Ваша корзина пуста</h1>
        <p className="text-lg text-gray-600 mb-6">Добавьте товары в корзину, чтобы оформить заказ</p>
        <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
          <Link href="/catalog">Перейти в каталог</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/catalog" className="flex items-center text-green-600 hover:text-green-700 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Продолжить покупки
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold mb-8">Корзина</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold">Товары в корзине</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-gray-500 hover:text-red-500 text-sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Очистить
              </Button>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.product.id} className="p-4 flex items-center">
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={item.product.image_url || "/placeholder.svg?height=100&width=100"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="ml-4 flex-grow">
                    <Link
                      href={`/product/${item.product.id}`}
                      className="font-medium hover:text-green-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-gray-500 text-sm">
                      {item.product.price && item.product.price > 0
                        ? `${item.product.price.toLocaleString()} ₽/${item.product.unit}`
                        : "Цена по запросу"
                      }
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center border border-gray-200 rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none rounded-l-md"
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
                        className="w-14 text-center border-0 focus:ring-0 focus:outline-none"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none rounded-r-md"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <span className="font-medium min-w-[7rem] text-right">
                      {item.product.price && item.product.price > 0
                        ? `${(item.product.price * item.quantity).toLocaleString()} ₽`
                        : "Цена по запросу"
                      }
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary and Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="font-semibold mb-4">Итого</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Товары ({items.length}):</span>
              <span>{totalPrice && totalPrice > 0 ? totalPrice.toLocaleString() : "0"} ₽</span>
            </div>
            <div className="border-t border-gray-100 my-4"></div>
            <div className="flex justify-between font-bold text-lg">
              <span>Общая сумма:</span>
              <span>{totalPrice && totalPrice > 0 ? totalPrice.toLocaleString() : "0"} ₽</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold mb-4">Оформление заказа</h2>
            <form onSubmit={handleSubmitOrder}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Имя <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите ваше имя"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (___) ___-____"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Адрес доставки
                  </label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Введите адрес доставки"
                  />
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium mb-1">
                    Комментарий к заказу
                  </label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Дополнительная информация к заказу"
                    rows={3}
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    Я согласен на обработку персональных данных в соответствии с{" "}
                    <a href="/privacy" className="text-green-600 hover:text-green-700 underline">
                      Политикой конфиденциальности
                    </a>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Оформление..." : "Оформить заказ"}
                </Button>

                <p className="text-xs text-gray-500">
                  Нажимая кнопку "Оформить заказ", вы подтверждаете согласие с условиями обработки персональных данных.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
