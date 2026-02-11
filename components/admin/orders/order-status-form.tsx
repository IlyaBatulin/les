"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface OrderStatusFormProps {
  orderId: number
  currentStatus: string
}

export default function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      router.refresh()
    } catch {
      alert("Не удалось обновить статус заказа")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Выберите статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">Новый</SelectItem>
          <SelectItem value="processing">В обработке</SelectItem>
          <SelectItem value="shipped">Отправлен</SelectItem>
          <SelectItem value="delivered">Доставлен</SelectItem>
          <SelectItem value="cancelled">Отменен</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="submit"
        disabled={isSubmitting || status === currentStatus}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Обновить статус
      </Button>
    </form>
  )
}
