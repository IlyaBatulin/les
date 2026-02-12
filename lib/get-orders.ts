import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"

export async function getOrdersForAdmin() {
  if (!(await checkAdminSession())) return null
  const db = getDb()
  const r = await db.query("SELECT * FROM orders ORDER BY created_at DESC")
  return r.rows
}

export async function getOrderById(id: string) {
  if (!(await checkAdminSession())) return null
  const db = getDb()
  const orderRes = await db.query("SELECT * FROM orders WHERE id = $1", [id])
  const order = orderRes.rows[0]
  if (!order) return null

  const itemsRes = await db.query(
    `SELECT oi.*, p.id as "product_id", p.name as "product_name", p.image_url as "product_image_url", p.price as "product_price"
     FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`,
    [id]
  )
  const items = itemsRes.rows.map((row: { id: number; order_id: number; product_id: number; quantity: number; price: number; product_name: string; product_image_url: string | null; product_price: number }) => ({
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    quantity: row.quantity,
    price: row.price,
    product: {
      id: row.product_id,
      name: row.product_name,
      image_url: row.product_image_url,
      price: row.product_price,
    },
  }))

  return { ...order, items }
}

export async function getAdminStats() {
  if (!(await checkAdminSession())) return null
  const db = getDb()
  const [productsRes, categoriesRes, ordersRes, newOrdersRes] = await Promise.all([
    db.query("SELECT COUNT(*)::int as c FROM products"),
    db.query("SELECT COUNT(*)::int as c FROM categories"),
    db.query("SELECT COUNT(*)::int as c FROM orders"),
    db.query("SELECT COUNT(*)::int as c FROM orders WHERE status = 'new'"),
  ])
  return {
    productsCount: productsRes.rows[0]?.c ?? 0,
    categoriesCount: categoriesRes.rows[0]?.c ?? 0,
    ordersCount: ordersRes.rows[0]?.c ?? 0,
    newOrdersCount: newOrdersRes.rows[0]?.c ?? 0,
  }
}
