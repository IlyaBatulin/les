"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import ProductCard from '@/components/product-card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Product } from '@/lib/types'

export default function HomeProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const supabase = createClientSupabaseClient()
        
        // Загружаем последние добавленные товары
        const { data: latest } = await supabase
          .from('products')
          .select('*, category:categories(id, name)')
          .order('created_at', { ascending: false })
          .limit(8)
        
        // Загружаем популярные товары (предполагаем, что есть поле views или sales)
        const { data: popular } = await supabase
          .from('products')
          .select('*, category:categories(id, name)')
          .order('views', { ascending: false })
          .limit(8)
        
        // Преобразуем данные перед установкой в состояние
        const processedLatest = latest ? formatProducts(latest) : []
        const processedPopular = popular ? formatProducts(popular) : []
        
        setNewProducts(processedLatest)
        setPopularProducts(processedPopular.length > 0 ? processedPopular : processedLatest)
        setProducts(processedLatest)
      } catch (error) {
        console.error('Ошибка при загрузке товаров:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])
  
  // Функция для преобразования данных от Supabase в формат Product[]
  const formatProducts = (data: any[]): Product[] => {
    return data.map(item => {
      const categoryData = item.category && typeof item.category === 'object' 
        ? { 
            id: item.category.id, 
            name: item.category.name 
          } 
        : null;
        
      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        stock: item.stock || 0,
        unit: item.unit || 'шт',
        category_id: item.category_id,
        image_url: item.image_url,
        characteristics: item.characteristics || {},
        created_at: item.created_at,
        updated_at: item.updated_at,
        category: categoryData
      } as Product;
    });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Наши товары</h2>
          <Link href="/catalog" className="text-green-600 hover:text-green-700 font-medium flex items-center">
            Все товары <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        <Tabs defaultValue="all" className="mb-8">
          
          <TabsContent value="all" className="mt-0">
            <ProductGrid products={products} loading={loading} />
          </TabsContent>
          
          <TabsContent value="new" className="mt-0">
            <ProductGrid products={newProducts} loading={loading} />
          </TabsContent>
          
          <TabsContent value="popular" className="mt-0">
            <ProductGrid products={popularProducts} loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function ProductGrid({ products, loading }: { products: Product[], loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
