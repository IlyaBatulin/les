import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Уведомления отправляются автоматически при сохранении заказа" },
    { status: 410 },
  )
}
