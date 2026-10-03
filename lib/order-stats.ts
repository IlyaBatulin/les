type ChartOrder = { created_at: string | Date; total_amount: number | string; status?: string }
export function buildOrderChartData(orders: ChartOrder[]) {
  const months: Record<string, { cents: number; count: number }> = {}
  const format = new Intl.DateTimeFormat("en", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit" })
  for (const order of orders) {
    const date = new Date(order.created_at)
    if (!Number.isFinite(date.getTime())) continue
    const parts = format.formatToParts(date)
    const key = `${parts.find(part => part.type === "year")?.value}-${parts.find(part => part.type === "month")?.value}`
    const month = months[key] ||= { cents: 0, count: 0 }
    month.count++
    const total = Number(order.total_amount)
    if (order.status !== "cancelled" && Number.isFinite(total)) month.cents += Math.round(total * 100)
  }
  const rows = Object.entries(months).sort(([a], [b]) => a.localeCompare(b))
  const label = (key: string) => `${key.slice(5)}.${key.slice(0, 4)}`
  return {
    salesData: rows.map(([key, row]) => ({ month: label(key), total: row.cents / 100 })),
    ordersCountData: rows.map(([key, row]) => ({ month: label(key), count: row.count })),
  }
}
