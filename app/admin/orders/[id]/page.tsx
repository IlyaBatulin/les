export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from "@/lib/supabase"
import { notFound } from "next/navigation"
import ProtectedRoute from "@/components/admin/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import OrderStatusForm from "@/components/admin/orders/order-status-form"
import DeleteOrderButton from "@/components/admin/orders/delete-order-button"

async function getOrder(id: string) {
  const supabase = createServerSupabaseClient()

  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", id).single()

  if (orderError || !order) {
    console.error("Error fetching order:", orderError)
    return null
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(`
      *,
      product:products(id, name, image_url, price)
    `)
    .eq("order_id", id)

  if (itemsError) {
    console.error("Error fetching order items:", itemsError)
    return { ...order, items: [] }
  }

  return { ...order, items: items || [] }
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)

  if (!order) {
    notFound()
  }

  // Функция для форматирования даты
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Функция для форматирования цены
  function formatPrice(price: number) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(price)
  }

  // Функция для получения текста статуса
  function getStatusText(status: string) {
    switch (status) {
      case "new":
        return "Новый"
      case "processing":
        return "В обработке"
      case "shipped":
        return "Отправлен"
      case "delivered":
        return "Доставлен"
      case "cancelled":
        return "Отменен"
      default:
        return status
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Заказ #{order.id}</h1>
              <p className="text-gray-500">Создан: {formatDate(order.created_at)}</p>
            </div>
          </div>
          
          <DeleteOrderButton orderId={order.id.toString()} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Товары в заказе</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.length > 0 ? (
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="px-4 py-2 text-left">Товар</th>
                            <th className="px-4 py-2 text-right">Цена</th>
                            <th className="px-4 py-2 text-right">Кол-во</th>
                            <th className="px-4 py-2 text-right">Сумма</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item: any) => (
                            <tr key={item.id} className="border-b">
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-3">
                                  {item.product.image_url && (
                                    <img
                                      src={item.product.image_url || "/placeholder.svg"}
                                      alt={item.product.name}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  )}
                                  <span>{item.product.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right">{formatPrice(item.price)}</td>
                              <td className="px-4 py-2 text-right">{item.quantity}</td>
                              <td className="px-4 py-2 text-right">{formatPrice(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 font-medium">
                            <td colSpan={3} className="px-4 py-2 text-right">
                              Итого:
                            </td>
                            <td className="px-4 py-2 text-right">{formatPrice(order.total_amount)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">Нет товаров в заказе</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Комментарий к заказу</CardTitle>
              </CardHeader>
              <CardContent>
                {order.comment ? <p>{order.comment}</p> : <p className="text-gray-500">Комментарий отсутствует</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Информация о клиенте</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Имя</dt>
                    <dd>{order.customer_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Телефон</dt>
                    <dd>{order.customer_phone}</dd>
                  </div>
                  {order.customer_email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd>{order.customer_email}</dd>
                    </div>
                  )}
                  {order.delivery_address && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Адрес доставки</dt>
                      <dd>{order.delivery_address}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статус заказа</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Текущий статус</div>
                    <div className="font-medium">{getStatusText(order.status)}</div>
                  </div>
                  <OrderStatusForm orderId={order.id} currentStatus={order.status} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
