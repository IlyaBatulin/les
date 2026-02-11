export const dynamic = 'force-dynamic'

import { adminFetch } from "@/lib/admin-fetch"
import ProtectedRoute from "@/components/admin/protected-route"
import { DataTable } from "@/components/admin/orders/data-table"
import { columns } from "@/components/admin/orders/columns"

async function getOrders() {
  const res = await adminFetch("/api/orders")
  if (!res.ok) return []
  return res.json()
}

export default async function OrdersPage() {
  const fullOrders = await getOrders()

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Управление заказами</h1>
          <p className="text-gray-500 mt-2">Просмотр и обработка заказов клиентов</p>
        </div>

        <DataTable columns={columns} data={fullOrders} />
      </div>
    </ProtectedRoute>
  )
}
