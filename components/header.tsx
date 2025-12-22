"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Search, ShoppingCart, X, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MobileNav } from "@/components/mobile-nav"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { CartDrawer } from "@/components/cart-drawer"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// Обновляем тип Category, чтобы он соответствовал типу в mobile-nav.tsx
type Category = {
  id: number
  name: string
  parent_id: number | null
  description?: string | null
  image_url?: string | null
  position?: number | null
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{
    products: { id: number; name: string }[]
    categories: { id: number; name: string }[]
  }>({ products: [], categories: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [mainCategories, setMainCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<Category[]>([])
  const [sizes, setSizes] = useState<Category[]>([])
  const [activeMainCategory, setActiveMainCategory] = useState<number | null>(null)
  const [activeSubCategory, setActiveSubCategory] = useState<number | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const catalogRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { totalItems, isCartOpen, setIsCartOpen } = useCart()
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)
  const [snowflakes, setSnowflakes] = useState<Array<{ left: string; top: string; delay: string; duration: string }>>([])

  // Генерация снежинок только на клиенте, чтобы избежать hydration mismatch
  useEffect(() => {
    const flakes = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
    }))
    setSnowflakes(flakes)
  }, [])

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        // Получаем основные категории (без родителя)
        const { data: mainCats } = await supabase
          .from("categories")
          .select("id, name, parent_id, image_url, position")
          .is("parent_id", null)
          .order("position", { ascending: true })
          .order("name")
        
        if (mainCats) {
          // Сортировка по position, если есть, иначе по id
          const sorted = mainCats.sort((a, b) => {
            const aPos = a.position == null ? null : Number(a.position)
            const bPos = b.position == null ? null : Number(b.position)
            const aId = Number(a.id)
            const bId = Number(b.id)
            if (aPos == null && bPos == null) return aId - bId
            if (aPos == null) return 1
            if (bPos == null) return -1
            return aPos - bPos
          })
          setMainCategories(sorted.map(cat => ({
            id: Number(cat.id),
            name: String(cat.name),
            parent_id: null,
            image_url: cat.image_url as string | null,
            position: cat.position == null ? null : Number(cat.position)
          })))
        }
      } catch (error) {
        console.error("Ошибка при загрузке категорий:", error)
      }
    }
    
    fetchCategories()
  }, [])

  // Загрузка подкатегорий при выборе основной категории
  useEffect(() => {
    if (activeMainCategory === null) {
      setSubCategories([])
      setActiveSubCategory(null)
      return
    }

    const fetchSubCategories = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        const { data: subCats } = await supabase
          .from("categories")
          .select("id, name, parent_id, image_url, position")
          .eq("parent_id", activeMainCategory)
          .order("position", { ascending: true })
          .order("name")
        
        if (subCats) {
          // Сортировка по position, если есть, иначе по id
          const sorted = subCats.sort((a, b) => {
            const aPos = a.position == null ? null : Number(a.position)
            const bPos = b.position == null ? null : Number(b.position)
            const aId = Number(a.id)
            const bId = Number(b.id)
            if (aPos == null && bPos == null) return aId - bId
            if (aPos == null) return 1
            if (bPos == null) return -1
            return aPos - bPos
          })
          setSubCategories(sorted.map(cat => ({
            id: Number(cat.id),
            name: String(cat.name),
            parent_id: Number(cat.parent_id),
            image_url: cat.image_url as string | null,
            position: cat.position == null ? null : Number(cat.position)
          })))
        }
      } catch (error) {
        console.error("Ошибка при загрузке подкатегорий:", error)
      }
    }
    
    fetchSubCategories()
  }, [activeMainCategory])

  // Загрузка размеров при выборе подкатегории
  useEffect(() => {
    if (activeSubCategory === null) {
      setSizes([])
      return
    }

    const fetchSizes = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        // Загружаем только реальные данные из базы
        const { data: sizesData } = await supabase
          .from("categories")
          .select("id, name, parent_id")
          .eq("parent_id", activeSubCategory)
          .order("name")
        
        if (sizesData) {
          setSizes(sizesData.map(size => ({
            id: Number(size.id),
            name: String(size.name),
            parent_id: Number(size.parent_id)
          })))
        }
      } catch (error) {
        console.error("Ошибка при загрузке размеров:", error)
      }
    }
    
    fetchSizes()
  }, [activeSubCategory])

  // Обработчик клика вне области поиска и каталога
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
      
      if (catalogRef.current && !catalogRef.current.contains(event.target as Node)) {
        setShowCatalog(false)
        setActiveMainCategory(null)
        setActiveSubCategory(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Функция для выполнения поиска
  const performSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults({ products: [], categories: [] })
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)

    try {
      const supabase = createClientSupabaseClient()

      // Поиск товаров
      const { data: products } = await supabase.from("products").select("id, name").ilike("name", `%${query}%`).limit(5)

      // Поиск категорий
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .ilike("name", `%${query}%`)
        .limit(5)

      setSearchResults({
        products: products ? products.map(p => ({ id: Number(p.id), name: String(p.name) })) : [],
        categories: categories ? categories.map(c => ({ id: Number(c.id), name: String(c.name) })) : [],
      })
    } catch (error) {
      console.error("Ошибка при поиске:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Используем debounce для предотвращения слишком частых запросов
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  // Обработчик нажатия Enter в поле поиска
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowResults(false)
    }
  }

  // Обработчик клика на результат поиска
  const handleResultClick = (type: "product" | "category", id: number) => {
    if (type === "product") {
      router.push(`/product/${id}`)
    } else {
      router.push(`/catalog?category=${id}`)
    }
    setShowResults(false)
    setSearchQuery("")
  }

  // Очистка поискового запроса
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults({ products: [], categories: [] })
    setShowResults(false)
  }

  // Обработчик наведения на основную категорию
  const handleMainCategoryHover = (categoryId: number) => {
    setActiveMainCategory(categoryId)
    setActiveSubCategory(null)
  }

  // Обработчик наведения на подкатегорию
  const handleSubCategoryHover = (categoryId: number) => {
    setActiveSubCategory(categoryId)
  }

  // Обработчик клика на категорию (для перехода)
  const handleCategoryClick = (categoryId: number) => {
    router.push(`/catalog?category=${categoryId}`)
    setShowCatalog(false)
    setActiveMainCategory(null)
    setActiveSubCategory(null)
  }

  // Переключение видимости каталога
  const toggleCatalog = () => {
    setShowCatalog(!showCatalog)
    if (!showCatalog) {
      setActiveMainCategory(null)
      setActiveSubCategory(null)
    }
  }

  const getCategoryImage = (categoryId: number): string => {
    // Сначала ищем в основных категориях
    const mainCategory = mainCategories.find(cat => cat.id === categoryId);
    if (mainCategory?.image_url) return mainCategory.image_url;
    
    // Затем ищем в подкатегориях
    const subCategory = subCategories.find(cat => cat.id === categoryId);
    return subCategory?.image_url || "/placeholder.svg";
  };

  const getCategoryName = (categoryId: number): string => {
    const category = mainCategories.find(cat => cat.id === categoryId);
    return category?.name || "Категория";
  };

  return (
    <header className="w-full bg-gradient-to-r from-red-100 via-white to-green-100 text-gray-800 shadow-md sticky top-0 z-[100] relative">
      {/* Новогодний фон с узором */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.1),transparent_50%)]"></div>
      </div>
      
      {/* Новогодние снежинки - рендерятся только на клиенте */}
      {snowflakes.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {snowflakes.map((flake, i) => (
            <div
              key={i}
              className="absolute text-white/30 text-xs animate-snow"
              style={{
                left: flake.left,
                top: flake.top,
                animationDelay: flake.delay,
                animationDuration: flake.duration,
              }}
            >
              ❄
            </div>
          ))}
        </div>
      )}

      {/* Новогодняя надпись - только на десктопе */}
      <div className="hidden lg:block absolute top-2 right-4 z-40 pointer-events-none">
        <div className="relative">
          <span className="text-sm font-bold bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 bg-clip-text text-transparent animate-pulse">
            🎄 С Новым годом! 🎅
          </span>
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-yellow-400/20 to-green-500/20 blur-sm rounded-lg"></div>
        </div>
      </div>

      <div className="container mx-auto flex items-center justify-between py-3 px-4 relative z-30">
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <MobileNav categories={mainCategories} menuIconClassName="text-black" />
          </div>
          <Link href="/" className="flex items-center gap-2">
            <img 
                src="/logo.png" 
                alt="ВЫБОР+" 
                className="h-12 mr-3" 
              />
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent animate-pulse">
              ВЫБОР+
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center space-x-6">
          <div ref={catalogRef} className="relative z-[10001]">
            <button 
              className="flex items-center gap-1 font-medium hover:text-red-600 transition-colors relative z-30"
              onClick={toggleCatalog}
              onMouseEnter={() => setShowCatalog(true)}
            >
              Каталог <ChevronDown className="h-4 w-4" />
            </button>
            
            {showCatalog && (
              <div 
                className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md z-[10002] flex w-[900px]"
                onMouseLeave={() => setShowCatalog(false)}
              >
                {/* Первая колонка - основные категории */}
                <div className="w-1/3 border-r border-gray-200">
                  {mainCategories.map((category) => (
                    <div 
                      key={category.id} 
                      className={`px-4 py-3 cursor-pointer flex items-center justify-between ${activeMainCategory === category.id ? 'bg-gray-100 text-green-600' : 'hover:bg-gray-50'}`}
                      onMouseEnter={() => {
                        handleMainCategoryHover(category.id);
                        setHoveredCategory(category.id);
                      }}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <span>{category.name}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  ))}
                </div>
                
                {/* Вторая колонка - подкатегории */}
                <div className="w-1/3 border-r border-gray-200">
                  {activeMainCategory !== null && subCategories.map((category) => (
                    <div 
                      key={category.id} 
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 hover:text-green-600"
                      onMouseEnter={() => setHoveredCategory(category.id)}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <span>{category.name}</span>
                    </div>
                  ))}
                </div>
                
                {/* Колонка с изображением категории */}
                <div className="w-1/3 p-3">
                  {hoveredCategory && (
                    <div className="h-full">
                      <div className="relative w-full h-48 overflow-hidden rounded-lg">
                        <Image
                          src={getCategoryImage(hoveredCategory)}
                          alt={getCategoryName(hoveredCategory)}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-end">
                          <div className="w-full p-3 bg-gradient-to-t from-black/70 to-transparent">
                            <h3 className="text-white font-medium">
                              {getCategoryName(hoveredCategory)}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          
          <Link href="/delivery" className="font-medium hover:text-red-600 transition-colors">
            Доставка
          </Link>
          
          <Link href="/contacts" className="font-medium hover:text-red-600 transition-colors">
            Контакты
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-start space-y-1">
              <a href="tel:+7 (495) 077-97-79" className="text-sm text-gray-600 hover:text-red-600 font-bold">
                +7 (495) 077-97-79
              </a>
              <a href="tel:+7 (926) 777-97-79" className="text-sm text-gray-600 hover:text-red-600 font-bold">
                +7 (926) 777-97-79
              </a>
            </div>
            <a href="mailto:zakaz@vyborplus.ru" className="text-sm text-gray-600 hover:text-red-600 font-bold">
              zakaz@vyborplus.ru
            </a>
          </div>
        </div>
  
        <div className="flex items-center gap-4">
          <div ref={searchRef} className="relative hidden md:block">
            <div className="relative flex items-center">
              <Input
                type="search"
                placeholder="Поиск товаров..."
                className="w-64 rounded-md bg-gray-100 text-black pr-8 border-gray-200"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              />
              {searchQuery ? (
                <button onClick={clearSearch} className="absolute right-8 text-gray-500 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <Search className="absolute right-2 h-4 w-4 text-gray-500" />
            </div>

            {/* Выпадающее меню с результатами поиска */}
            {showResults && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg z-50 max-h-80 overflow-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="inline-block h-4 w-4 border-2 border-t-transparent border-green-600 rounded-full animate-spin mr-2"></div>
                    Поиск...
                  </div>
                ) : searchResults.products.length === 0 && searchResults.categories.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery.length >= 2 ? "Ничего не найдено" : "Введите минимум 2 символа"}
                  </div>
                ) : (
                  <>
                    {searchResults.categories.length > 0 && (
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 px-2 py-1">Категории</div>
                        {searchResults.categories.map((category) => (
                          <div
                            key={category.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-md text-gray-800"
                            onClick={() => handleResultClick("category", category.id)}
                          >
                            {category.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.products.length > 0 && (
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 px-2 py-1">Товары</div>
                        {searchResults.products.map((product) => (
                          <div
                            key={product.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-md text-gray-800"
                            onClick={() => handleResultClick("product", product.id)}
                          >
                            {product.name}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-2 border-t">
                      <button
                        className="w-full text-center py-2 text-green-600 hover:text-green-800 text-sm"
                        onClick={() => {
                          router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`)
                          setShowResults(false)
                        }}
                      >
                        Показать все результаты
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-gray-800 hover:text-red-600 hover:bg-gray-100" 
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-600 to-green-600 text-white text-xs animate-pulse">
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <CartDrawer />
    </header>
  )
}
