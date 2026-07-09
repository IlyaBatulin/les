import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import ProductImage from "@/components/product-image"

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
      <Card className={`group overflow-hidden border-gray-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg ${className || ""}`}>
        <div className="relative h-40 w-full overflow-hidden bg-gray-100">
          <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
            <ProductImage
              src={imageUrl}
              alt={name}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
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
