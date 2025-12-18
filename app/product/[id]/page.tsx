import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ProductPageClient } from "@/components/product-page-client"

interface ProductPageProps {
  params: Promise<{
    id: string
  }> | {
    id: string
  }
}

async function getProduct(id: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(id, name, parent_id)
      `,
      )
      .eq("id", id)
      .single()

    if (error) {
      console.error("Ошибка при загрузке товара:", error)
      return null
    }

    if (!product) {
      return null
    }

  // Получаем родительские категории для хлебных крошек
  if (product.category && product.category.parent_id) {
    const { data: parentCategory } = await supabase
      .from("categories")
      .select("id, name, parent_id")
      .eq("id", product.category.parent_id)
      .single()

    if (parentCategory) {
      product.category.parent = parentCategory

      // Если есть еще один уровень родительской категории
      if (parentCategory.parent_id) {
        const { data: grandParentCategory } = await supabase
          .from("categories")
          .select("id, name")
          .eq("id", parentCategory.parent_id)
          .single()

        if (grandParentCategory) {
          product.category.parent.parent = grandParentCategory
        }
      }
    }
  }

    // Получаем похожие товары из той же категории
    const { data: relatedProducts, error: relatedError } = await supabase
      .from("products")
      .select("id, name, price, image_url, unit")
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .limit(4)

    if (relatedError) {
      console.error("Ошибка при загрузке похожих товаров:", relatedError)
    }

    return { product, relatedProducts: relatedProducts || [] }
  } catch (error) {
    console.error("Критическая ошибка при загрузке товара:", error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // В Next.js 16 params может быть Promise, нужно await
  const resolvedParams = params instanceof Promise ? await params : params
  const productId = resolvedParams.id

  if (!productId) {
    notFound()
  }

  const data = await getProduct(productId)

  if (!data) {
    notFound()
  }

  const { product, relatedProducts } = data

  // Строим хлебные крошки
  const breadcrumbs = []
  let currentCategory = product.category

  while (currentCategory) {
    breadcrumbs.unshift({
      id: currentCategory.id,
      name: currentCategory.name,
    })
    currentCategory = currentCategory.parent
  }

  return (
    <ProductPageClient 
      product={product}
      relatedProducts={relatedProducts}
      breadcrumbs={breadcrumbs}
    />
  )
}