export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from "@/lib/supabase"
import ProtectedRoute from "@/components/admin/protected-route"
import { DataTable } from "@/components/admin/orders/data-table"
import { columns } from "@/components/admin/orders/columns"

async function getOrders() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.error(error)
    return []
  }
  return data || []
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
