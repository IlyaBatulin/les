import HomeHero from "@/components/home/home-hero"
import HomeBenefits from "@/components/home/home-benefits"
import HomeCategories from "@/components/home/home-categories"
import HomeProducts from "@/components/home/home-products"
import HomeCta from "@/components/home/home-cta"
import HomeTestimonials from "@/components/home/home-testimonials"
import { LeadPopup } from "@/components/lead-popup"
import { Suspense } from "react"
import Empty from "@/components/home/empty"

// Заглушки для загрузки динамических компонентов
function CategoriesSkeleton() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductsSkeleton() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-40 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="w-full max-w-md mx-auto flex justify-center space-x-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 flex-1 bg-gray-300 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-300 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HomeHero />
      {/* Benefits Section */}
      <HomeBenefits />

      {/* Categories Section (с Suspense для улучшения производительности) */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <HomeCategories />
      </Suspense>

      {/* Products Section (с Suspense для улучшения производительности) */}
      <Suspense fallback={<ProductsSkeleton />}>
        <HomeProducts />
      </Suspense>

      {/* CTA Section */}
      <HomeCta />

      {/* Всплывающая плашка для заявок */}
      <LeadPopup />
    </div>
  )
}
