import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Товар не найден</h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        К сожалению, запрашиваемый товар не существует или был удален.
      </p>
      <Button asChild>
        <Link href="/catalog" className="flex items-center justify-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Вернуться в каталог
        </Link>
      </Button>
    </div>
  )
}
