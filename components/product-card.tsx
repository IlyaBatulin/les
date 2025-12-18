"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { LumberPriceToggle, useLumberPriceToggle, PriceUnit } from "@/components/lumber-price-toggle"
import { useLumberCategory } from "@/hooks/use-lumber-category"
import { useLumberPriceCalculation } from "@/hooks/use-lumber-price-calculation"

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const { isLumberProduct, supportsCubicPricing } = useLumberCategory()
  const { getPrice, formatPrice } = useLumberPriceCalculation()
  const { priceUnit, handleUnitChange } = useLumberPriceToggle("piece")

  const isLumber = isLumberProduct(product)
  const showPriceToggle = isLumber && supportsCubicPricing(product)

  // Получаем актуальную цену в зависимости от выбранной единицы
  const currentPriceInfo = getPrice(product, priceUnit)

  // Подготавливаем продукт для корзины
  const cartProduct = {
    id: product.id,
    name: product.name,
    price: currentPriceInfo?.price || product.price,
    image_url: product.image_url,
    quantity: 1,
    unit: currentPriceInfo?.displayUnit || product.unit || "шт",
    category_id: product.category_id,
  }

  // Если режим отображения - список, используем другую разметку
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-60 h-52">
            <Link href={`/product/${product.id}`}>
              <div className="relative w-full h-full">
                <Image
                  src={product.image_url || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover bg-white"
                  sizes="(max-width: 768px) 100vw, 240px"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            </Link>
            {product.stock <= 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500">Нет в наличии</Badge>
            )}
          </div>
          
          <div className="flex-1 flex flex-col p-4">
            <Link href={`/product/${product.id}`} className="hover:underline">
              <h3 className="font-medium text-base md:text-lg line-clamp-2">{product.name}</h3>
            </Link>
            
            <p className="text-gray-500 text-sm line-clamp-2 mt-2 mb-4">
              {product.description || `${product.category?.name || 'Товар'} высокого качества`}
            </p>
            
            <div className="mt-auto mb-3">
              {showPriceToggle && (
                <div className="mb-2 flex justify-end">
                  <LumberPriceToggle 
                    selectedUnit={priceUnit}
                    onUnitChange={handleUnitChange}
                    size="sm"
                  />
                </div>
              )}
              <div className="font-semibold text-right text-lg">
                {currentPriceInfo && currentPriceInfo.price && currentPriceInfo.price > 0 ? (
                  <>
                    {currentPriceInfo.price.toLocaleString("ru-RU")} ₽<span className="text-xs font-normal text-gray-500">/{currentPriceInfo.displayUnit}</span>
                  </>
                ) : product.price && product.price > 0 ? (
                  <>
                    {product.price.toLocaleString("ru-RU")} ₽<span className="text-xs font-normal text-gray-500">/{product.unit}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Цена по запросу</span>
                )}
              </div>
              {/* Убрано отображение количества в наличии */}
            </div>
            
            <div className="flex justify-end mt-2">
              <AddToCartButton 
                product={cartProduct} 
                className="w-auto"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Стандартный режим отображения (плитка)
  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300 flex flex-col h-full cursor-pointer">
        <div className="relative pt-[100%]">
          <div className="absolute inset-0">
            <Image
              src={product.image_url || "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover bg-white"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              priority
            />
          </div>
          {product.stock <= 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-xs whitespace-nowrap">Нет в наличии</Badge>
          )}
        </div>
        
        <div className="p-3 flex-1 flex flex-col h-full">
          <h3 className="font-medium text-sm line-clamp-2 hover:text-green-600 transition-colors mb-2">
            {product.name}
          </h3>
          
          <div className="mt-auto">
            {showPriceToggle && (
              <div className="mb-1 flex justify-end">
                <LumberPriceToggle 
                  selectedUnit={priceUnit}
                  onUnitChange={handleUnitChange}
                  size="sm"
                />
              </div>
            )}
            <div className="mb-2 text-right">
              <p className="text-base font-semibold">
                {currentPriceInfo && currentPriceInfo.price && currentPriceInfo.price > 0 ? (
                  <>
                    {currentPriceInfo.price.toLocaleString("ru-RU")} ₽<span className="text-xs font-normal text-gray-500">/{currentPriceInfo.displayUnit}</span>
                  </>
                ) : product.price && product.price > 0 ? (
                  <>
                    {product.price.toLocaleString("ru-RU")} ₽<span className="text-xs font-normal text-gray-500">/{isLumber ? "шт" : (product.unit || "шт")}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Цена по запросу</span>
                )}
              </p>
              {/* Убрано отображение количества в наличии */}
            </div>
            
            <div className="flex justify-end">
              <AddToCartButton 
                product={cartProduct} 
                className="w-auto h-9 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}