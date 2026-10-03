import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { checkAdminSession } from "@/lib/admin-auth"

import { sendOrderNotification } from "@/lib/order-mail"
import { createLumberPriceCalculation } from "@/lib/lumber-pricing"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer_name, customer_phone, customer_email, delivery_address, comment, items } = body
    if (!customer_name || !customer_phone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "customer_name, customer_phone and items required" }, { status: 400 })
    }
    if (items.some((item: { product_id: number; quantity: number }) =>
      !Number.isInteger(item.product_id) || !Number.isFinite(item.quantity) || item.quantity <= 0
    )) {
      return NextResponse.json({ error: "Некорректные позиции заказа" }, { status: 400 })
    }
    const db = getDb()
    const client = await db.connect()
    let order
    let orderItems: { product: { name: string; price: number; unit: string }; quantity: number }[] = []
    try {
      await client.query("BEGIN")
      const productIds = [...new Set(items.map((i: { product_id: number }) => i.product_id))]
      const checkRes = await client.query("SELECT * FROM products WHERE id = ANY($1::int[])", [productIds])
      if (checkRes.rows.length !== productIds.length) {
        await client.query("ROLLBACK")
        return NextResponse.json({ error: "Некоторые товары недоступны" }, { status: 400 })
      }
      orderItems = items.map((item: { product_id: number; quantity: number; unit?: string }) => {
        const product = checkRes.rows.find((p) => p.id === item.product_id)!
        const unit = item.unit || product.unit || "шт"
        const calculated = createLumberPriceCalculation().getPrice(product, unit === "м³" ? "cubic" : "piece")
        if (unit !== "м³" && unit !== "шт" && unit !== product.unit) throw new Error("Invalid order unit")
        if (unit === "м³" && !calculated) throw new Error("Cubic price unavailable")
        return { product: { name: product.name, price: calculated?.price ?? (Number(product.price) || 0), unit }, quantity: item.quantity }
      })
      const total = Math.round(orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * 100) / 100
      const unitSummary = orderItems.map(item => `${item.product.name}: ${item.quantity} ${item.product.unit}`).join("; ")
      const orderComment = [comment, `Единицы заказа: ${unitSummary}`].filter(Boolean).join("\n")
      const orderRes = await client.query(
        `INSERT INTO orders (customer_name, customer_phone, customer_email, delivery_address, comment, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'new') RETURNING *`,
        [customer_name, customer_phone, customer_email ?? null, delivery_address ?? null, orderComment, total]
      )
      order = orderRes.rows[0]
      for (let i = 0; i < items.length; i++) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
          [order.id, items[i].product_id, orderItems[i].quantity, orderItems[i].product.price]
        )
      }
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
    // Письмо отправляется после сохранения всех позиций, независимо от браузера.
    let notificationSent = false
    try {
      await sendOrderNotification({
        orderId: order.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerEmail: order.customer_email,
        deliveryAddress: order.delivery_address,
        comment: order.comment,
        totalAmount: Number(order.total_amount),
        items: orderItems,
      })
      notificationSent = true
    } catch {
      // Заказ уже сохранён: не возвращаем ошибку, провоцирующую повторный заказ.
      console.error("Order notification failed", { orderId: order.id })
    }
    return NextResponse.json({ ...order, notification_sent: notificationSent })
  } catch (e) {
    console.error("Orders POST error:", e)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}

export async function GET() {
  if (!(await checkAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const db = getDb()
    const result = await db.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Orders API error:", error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}
