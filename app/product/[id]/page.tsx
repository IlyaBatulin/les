import { notFound } from "next/navigation"
import { getProductWithRelated } from "@/lib/get-product"
import { ProductPageClient } from "@/components/product-page-client"

interface ProductPageProps {
  params: Promise<{
    id: string
  }> | {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // В Next.js 16 params может быть Promise, нужно await
  const resolvedParams = params instanceof Promise ? await params : params
  const productId = resolvedParams.id

  if (!productId) {
    notFound()
  }

  const data = await getProductWithRelated(productId)

  if (!data) {
    notFound()
  }

  const { product, breadcrumbs, relatedProducts } = data

  return (
    <ProductPageClient 
      product={product}
      relatedProducts={relatedProducts}
      breadcrumbs={breadcrumbs}
    />
  )
}