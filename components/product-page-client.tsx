"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductCharacteristics } from "@/components/product-characteristics"
import { ChevronLeft, ArrowRight, Truck, Info } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { LumberPriceToggle, useLumberPriceToggle } from "@/components/lumber-price-toggle"
import { useLumberCategory } from "@/hooks/use-lumber-category"
import { useLumberPriceCalculation } from "@/hooks/use-lumber-price-calculation"
import type { Product } from "@/lib/types"

interface ProductPageClientProps {
  product: Product & {
    category?: {
      id: number
      name: string
      parent_id?: number | null
      parent?: any
    }
  }
  relatedProducts: Array<{
    id: number
    name: string
    price: number
    image_url: string | null
    unit: string
  }>
  breadcrumbs: Array<{
    id: number
    name: string
  }>
}

export function ProductPageClient({ product, relatedProducts, breadcrumbs }: ProductPageClientProps) {
  const { isLumberProduct } = useLumberCategory()
  const { getPrice } = useLumberPriceCalculation()
  const { priceUnit, handleUnitChange } = useLumberPriceToggle("piece")

  const isLumber = isLumberProduct(product)
  const piecePriceInfo = getPrice(product, "piece")
  const cubicPriceInfo = getPrice(product, "cubic")
  const showPriceToggle = isLumber && !!piecePriceInfo && !!cubicPriceInfo

  // Получаем актуальную цену в зависимости от выбранной единицы
  const currentPriceInfo = getPrice(product, priceUnit)

  // Преобразуем Product в CartProduct для кнопки добавления в корзину
  const cartProduct = {
    id: product.id,
    name: product.name,
    price: currentPriceInfo?.price || product.price,
    image_url: product.image_url,
    unit: currentPriceInfo?.displayUnit || product.unit,
    category_id: product.category_id,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Хлебные крошки */}
      <nav className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/catalog" className="hover:text-green-600">
          Каталог
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.id} className="flex items-center">
            <span className="mx-2">/</span>
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-700">{crumb.name}</span>
            ) : (
              <Link
                href={`/catalog?category=${crumb.id}`}
                className="hover:text-green-600"
              >
                {crumb.name}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Кнопка возврата в категорию */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm"
          asChild 
          className="inline-flex items-center bg-white hover:bg-green-50 text-green-700 hover:text-green-800 border-green-200 hover:border-green-300 shadow-sm transition-all"
        >
          <Link href={`/catalog?category=${product.category_id}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Назад в категорию
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Изображение товара */}
        <div className="lg:w-1/2">
          <div className="relative aspect-square rounded-lg overflow-hidden border shadow-sm">
            <Image
              src={product.image_url || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              {product.category?.name || "Без категории"}
            </Badge>

            <Badge
              variant={product.stock > 0 ? "outline" : "destructive"}
              className={product.stock > 0 ? "bg-green-50 text-green-800 border-green-200" : ""}
            >
              {product.stock > 0 ? "В наличии" : "На заказ"}
            </Badge>
          </div>

          {/* Переключатель цены для пиломатериалов */}
          {showPriceToggle && (
            <div className="mb-4">
              <LumberPriceToggle 
                selectedUnit={priceUnit}
                onUnitChange={handleUnitChange}
                size="md"
              />
            </div>
          )}

          <div className="flex items-end gap-2 mb-6">
            <span className="text-3xl font-bold">
              {currentPriceInfo && currentPriceInfo.price > 0
                ? currentPriceInfo.price.toLocaleString("ru-RU")
                : product.price && product.price > 0
                ? product.price.toLocaleString("ru-RU")
                : "Цена по запросу"
              } ₽
            </span>
            <span className="text-gray-500">
              за {currentPriceInfo?.displayUnit || product.unit}
            </span>
          </div>

          {product.description && (
            <div className="mb-6">
              <h2 className="font-medium text-lg mb-2">Описание</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          <div className="flex gap-4 mb-8">
            <AddToCartButton product={cartProduct} className="w-auto" showQuantity />
          </div>

          {/* Характеристики товара */}
          {product.characteristics && typeof product.characteristics === 'object' && Object.keys(product.characteristics).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <ProductCharacteristics characteristics={product.characteristics} />
            </div>
          )}

          {/* Информация о доставке */}
          <div className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Доставка</h3>
                <p className="text-sm text-gray-600">
                  Доставка по Москве и области. Стоимость рассчитывается индивидуально.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-4">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Консультация</h3>
                <p className="text-sm text-gray-600">
                  Наши специалисты помогут выбрать подходящий материал для вашего проекта.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Похожие товары */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Похожие товары</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/product/${relatedProduct.id}`}
                className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square">
                  <Image
                    src={relatedProduct.image_url || "/placeholder.svg?height=200&width=200"}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2 mb-2">{relatedProduct.name}</h3>
                  <p className="text-lg font-bold">
                    {relatedProduct.price && relatedProduct.price > 0
                      ? `${relatedProduct.price.toLocaleString("ru-RU")} ₽`
                      : "Цена по запросу"
                    }
                    <span className="text-sm font-normal text-gray-500">/{relatedProduct.unit}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href={`/catalog?category=${product.category_id}`}>
                Смотреть все товары категории
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
