"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import previewManifest from "@/lib/catalog-image-previews.json"

const previews = previewManifest as Record<string, { src: string; width: number }[]>

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
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const [failedPreview, setFailedPreview] = useState<string | null>(null)
  const showLogo = !src || failedSource === src

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

  const variants = previews[src!]
  if (variants?.length && failedPreview !== src) {
    return (
      <img
        src={variants[Math.min(1, variants.length - 1)].src}
        srcSet={variants.map(image => `${image.src} ${image.width}w`).join(", ")}
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={cn("absolute inset-0 h-full w-full object-cover bg-white", className)}
        onError={() => setFailedPreview(src!)}
      />
    )
  }

  return (
    <Image
      src={process.env.NODE_ENV === "development" && src?.startsWith("/uploads/") ? `https://vyborplus.ru${src}` : src}
      alt={alt}
      unoptimized={process.env.NODE_ENV === "development"}
      fill
      className={cn("object-cover bg-white", className)}
      sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
      priority={priority}
      onError={() => setFailedSource(src!)}
    />
  )
}
