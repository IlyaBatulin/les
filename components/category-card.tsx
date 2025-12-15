import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CategoryCardProps {
  id: number
  name: string
  description?: string | null
  imageUrl?: string | null
  className?: string
  productCount?: number
}

export default function CategoryCard({
  id,
  name,
  description,
  imageUrl,
  className,
  productCount = 0,
}: CategoryCardProps) {
  return (
    <Link href={`/catalog?category=${id}`} className="block">
      <Card className={`overflow-hidden transition-all hover:shadow-md ${className || ""}`}>
        <div className="relative h-40 w-full bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <span className="text-gray-400">Нет изображения</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-gray-900">{name}</h3>
          </div>
          {description && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>}
        </CardContent>
      </Card>
    </Link>
  )
}
