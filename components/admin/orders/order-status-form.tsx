"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientSupabaseClient } from "@/lib/supabase"
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
      const supabase = createClientSupabaseClient()

      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId)

      if (error) {
        console.error("Error updating order status:", error)
        throw error
      }

      // Обновляем страницу для отображения изменений
      router.refresh()
    } catch (error) {
      console.error("Failed to update order status:", error)
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
