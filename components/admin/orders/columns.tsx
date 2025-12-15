"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"

// Определяем тип для заказа
export type Order = {
  id: number
  customer_name: string
  customer_phone: string
  customer_email: string | null
  delivery_address: string | null
  total_amount: number
  status: string
  created_at: string
  updated_at: string
}

// Функция для форматирования даты
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Функция для получения цвета статуса
function getStatusColor(status: string) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "processing":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "shipped":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200"
    case "delivered":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

// Функция для получения текста статуса
function getStatusText(status: string) {
  switch (status) {
    case "new":
      return "Новый"
    case "processing":
      return "В обработке"
    case "shipped":
      return "Отправлен"
    case "delivered":
      return "Доставлен"
    case "cancelled":
      return "Отменен"
    default:
      return status
  }
}

// Определяем колонки для таблицы
export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">#{row.getValue("id")}</div>,
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Клиент
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("customer_name")}</div>
        <div className="text-sm text-gray-500">{row.original.customer_phone}</div>
      </div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Сумма
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("total_amount"))
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      return (
        <Badge className={getStatusColor(status)} variant="outline">
          {getStatusText(status)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Дата
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div>{formatDate(row.getValue("created_at"))}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original

      return (
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/orders/${order.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">Просмотр заказа</span>
          </Link>
        </Button>
      )
    },
  },
]
