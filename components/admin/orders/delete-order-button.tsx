"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface DeleteOrderButtonProps {
  orderId: string
}

export default function DeleteOrderButton({ orderId }: DeleteOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const supabase = createClientSupabaseClient()
      
      // Сначала удаляем связанные записи в order_items
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId)
      
      if (itemsError) {
        throw new Error(`Ошибка при удалении позиций заказа: ${itemsError.message}`)
      }
      
      // Теперь удаляем сам заказ
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId)
      
      if (orderError) {
        throw new Error(`Ошибка при удалении заказа: ${orderError.message}`)
      }
      
      toast({
        title: "Заказ удален",
        description: `Заказ #${orderId} был успешно удален.`,
      })
      
      // Перенаправляем на страницу со списком заказов
      router.push("/admin/orders")
      router.refresh()
    } catch (error) {
      console.error("Ошибка при удалении заказа:", error)
      toast({
        title: "Ошибка удаления",
        description: error instanceof Error ? error.message : "Произошла ошибка при удалении заказа",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1"
      >
        <Trash2 className="h-4 w-4" />
        Удалить заказ
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заказ #{orderId}?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие невозможно отменить. Заказ будет удален из системы вместе со всеми позициями.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 