export const dynamic = "force-dynamic"

import { getOrdersForAdmin } from "@/lib/get-orders"
import ProtectedRoute from "@/components/admin/protected-route"
import { DataTable } from "@/components/admin/orders/data-table"
import { columns } from "@/components/admin/orders/columns"

export default async function OrdersPage() {
  const fullOrders = (await getOrdersForAdmin()) ?? []

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
