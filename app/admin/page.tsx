// Отключаем SSG/ISR — всегда SSR
export const dynamic = 'force-dynamic'
// Или, вместо force-dynamic, можно задать zero-revalidate:
// export const revalidate = 0

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminLayout from "@/components/admin/admin-layout"
import { Package, FolderTree, ShoppingBag, TrendingUp } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"
import SalesChart from "@/components/admin/orders/SalesChart"
import OrdersCountChart from "@/components/admin/orders/OrdersCountChart"

async function getDashboardStats() {
  const supabase = createServerSupabaseClient()

  // Получаем количество товаров
  const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })

  // Получаем количество категорий
  const { count: categoriesCount } = await supabase.from("categories").select("*", { count: "exact", head: true })

  // Получаем количество заказов
  const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true })

  // Получаем количество новых заказов
  const { count: newOrdersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "new")

  return {
    productsCount: productsCount || 0,
    categoriesCount: categoriesCount || 0,
    ordersCount: ordersCount || 0,
    newOrdersCount: newOrdersCount || 0,
  }
}

// Получаем сырые данные для графика
async function getSalesChartData() {
  const supabase = createServerSupabaseClient()
  const { data: orders, error } = await supabase
    .from("orders")
    .select("created_at, total_amount")
  if (error || !orders) return []

  // Группируем сумму по месяцу
  const map: Record<string, number> = {}
  orders.forEach(({ created_at, total_amount }) => {
    const d = new Date(created_at)
    const key = d.toLocaleString("ru-RU", { year: "numeric", month: "2-digit" })
    map[key] = (map[key] || 0) + total_amount
  })

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}

// количество заказов по месяцам
async function getOrdersCountData() {
  const supabase = createServerSupabaseClient()
  const { data: orders, error } = await supabase
    .from("orders")
    .select("created_at")
  if (error || !orders) return []

  const map: Record<string, number> = {}
  orders.forEach(({ created_at }) => {
    const m = new Date(created_at).toLocaleString("ru-RU", {
      year: "numeric", month: "2-digit"
    })
    map[m] = (map[m] || 0) + 1
  })

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))
}

export default async function AdminPage() {
  const stats = await getDashboardStats()
  const salesData = await getSalesChartData()
  const ordersCountData = await getOrdersCountData()

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Панель управления</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Товары</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.productsCount}</div>
                <p className="text-xs text-gray-500">Всего товаров</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Категории</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-4">
                <FolderTree className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.categoriesCount}</div>
                <p className="text-xs text-gray-500">Всего категорий</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-full mr-4">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.ordersCount}</div>
                <p className="text-xs text-gray-500">Всего заказов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Новые заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="bg-amber-100 p-2 rounded-full mr-4">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.newOrdersCount}</div>
                <p className="text-xs text-gray-500">Требуют обработки</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- два графика под карточками ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-4 rounded shadow">
          <SalesChart data={salesData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <OrdersCountChart data={ordersCountData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Управление товарами</CardTitle>
            <CardDescription>Добавление, редактирование и удаление товаров</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Добавляйте новые товары, обновляйте информацию о существующих и управляйте запасами.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/admin/products">Управление товарами</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Управление категориями</CardTitle>
            <CardDescription>Создание, редактирование и удаление категорий товаров</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Управляйте иерархией категорий, создавайте подкатегории и организуйте структуру каталога.
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/admin/categories">Управление категориями</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Управление заказами</CardTitle>
            <CardDescription>Просмотр и обработка заказов клиентов</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Просматривайте новые заказы, меняйте их статус и управляйте доставкой.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/admin/orders">Управление заказами</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Настройки</CardTitle>
            <CardDescription>Настройки магазина и системы</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Настройте параметры магазина, способы доставки и оплаты.</p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/admin/settings">Настройки</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
