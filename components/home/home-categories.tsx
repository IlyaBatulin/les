"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductImage from '@/components/product-image'
import { ArrowRight } from 'lucide-react'
import { CategorySkeleton } from '@/components/ui/category-skeleton'
import { catalogFetch } from '@/lib/catalog-fetch'

type Category = {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  image_url: string | null;
  position: number | null;
}

export default function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const res = await catalogFetch('/api/categories?parent=null')
        const data = res.ok ? await res.json() : null

        if (data && Array.isArray(data)) {
          // Дополнительно сортируем на клиенте, если position null
          const sorted = (data as Category[]).slice().sort((a, b) => {
            if (a.position == null && b.position == null) return a.id - b.id
            if (a.position == null) return 1
            if (b.position == null) return -1
            return a.position - b.position
          })
          setCategories(sorted.slice(0, 6))
        }
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  return (
    <section className="home-categories py-16">
      <div className="container mx-auto px-4">
        <div className="section-heading">
          <h2>Популярные категории</h2>
          <Link href="/catalog" className="text-green-600 hover:text-green-700 font-medium flex items-center">
            Все категории <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="category-grid">
            {[...Array(6)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/catalog?category=${category.id}`}
                className="category-tile group"
              >
                <ProductImage
                  src={category.image_url || '/placeholder.svg'}
                  alt={category.name}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-2xl font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-white/90 max-w-md hidden md:block group-hover:translate-x-2 transition-transform duration-300 delay-100">
                      {category.description}
                    </p>
                  )}
                  <span className="mt-3 text-sm text-white/80 flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-150">
                    Перейти <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
