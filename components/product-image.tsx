"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  src?: string | null
  alt: string
  sizes?: string
  className?: string
  priority?: boolean
}

/**
 * Изображение товара/категории с фолбэком: если фото нет или оно не загрузилось,
 * показываем логотип «Выбор+» на светлом фоне.
 */
export default function ProductImage({ src, alt, sizes, className, priority }: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  // При смене товара (src) сбрасываем состояние ошибки
  useEffect(() => {
    setFailed(false)
  }, [src])

  const showLogo = !src || failed

  if (showLogo) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Image
          src="/logo.png"
          alt={alt}
          fill
          className="object-contain p-8 opacity-40"
          sizes={sizes || "(max-width: 640px) 100vw, 25vw"}
        />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cn("object-cover bg-white", className)}
      sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
      priority={priority}
      onError={() => setFailed(true)}
    />
  )
}
