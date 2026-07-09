"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { FilterOptions, Product, Category } from "@/lib/types"
import { Search, Filter, X, RefreshCw, ChevronRight, ChevronLeft, Grid, List, SlidersHorizontal } from "lucide-react"
import DynamicFilterSidebar from "@/components/catalog/dynamic-filter-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import CategoryCard from "@/components/category-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/product-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CategorySkeleton } from '@/components/ui/category-skeleton'
import { useMediaQuery } from "@/hooks/use-media-query"
import { formatKey, effectiveCharacteristics, valuesEqual } from "@/lib/characteristics"

export default function CatalogPage() {
  const isMobile = useIsMobile()
  const useMobileFilters = useMediaQuery("(max-width: 1023px)")
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams?.get("category")
  const searchQuery = searchParams?.get("search") || ""
  const pageParam = searchParams?.get("page") || "1"
  const currentPage = Number.parseInt(pageParam, 10)
  const itemsPerPage = 12

  const [categoryPath, setCategoryPath] = useState<{ id: number; name: string }[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "")
  const [sortOrder, setSortOrder] = useState<"default" | "price-asc" | "price-desc" | "name-asc" | "name-desc">(
    "default",
  )
  const [isLoading, setIsLoading] = useState(true)
  const [categoryName, setCategoryName] = useState<string>("")
  const [hasSubcategories, setHasSubcategories] = useState(false)
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [showProducts, setShowProducts] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([])
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<number, number>>({})
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loadingCategories, setLoadingCategories] = useState(true)

  const initialFilters: FilterOptions = {
    categories: categoryParam ? [categoryParam] : [],
  }

  const [activeFilters, setActiveFilters] = useState<FilterOptions>(initialFilters)
  const [totalFiltersCount, setTotalFiltersCount] = useState(0)
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})

  useEffect(() => {
    let count = 0
    Object.entries(activeFilters).forEach(([key, filterArray]) => {
      if (key !== "categories") {
        count += filterArray.length
      }
    })
    setTotalFiltersCount(count)
  }, [activeFilters])

  // Загружаем имена категорий и количество товаров
  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ])
        if (catRes.ok) {
          const tree = await catRes.json()
          const flatten = (arr: any[]): { id: number; name: string }[] =>
            arr.flatMap((c) => [c, ...flatten(c.subcategories || [])])
          const flat = flatten(tree)
          const namesMap: Record<string, string> = {}
          flat.forEach((cat) => {
            namesMap[String(cat.id)] = cat.name
          })
          setCategoryNames(namesMap)
        }
        if (prodRes.ok) {
          const products = await prodRes.json()
          const counts: Record<number, number> = {}
          products.forEach((p: { category_id: number }) => {
            const cid = p.category_id
            counts[cid] = (counts[cid] || 0) + 1
          })
          setCategoryProductCounts(counts)
        }
      } catch (e) {
        console.error("Ошибка загрузки категорий/товаров:", e)
      }
    }
    loadCategoryData()
  }, [])

  // Загрузка подкатегорий
  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoadingCategories(true)
      try {
        if (!categoryParam) {
          const res = await fetch("/api/categories?parent=null")
          if (res.ok) {
            const data = await res.json()
            const sorted = [...data].sort((a: any, b: any) => {
              const aPos = a.position == null ? null : Number(a.position)
              const bPos = b.position == null ? null : Number(b.position)
              const aId = Number(a.id)
              const bId = Number(b.id)
              if (aPos == null && bPos == null) return aId - bId
              if (aPos == null) return 1
              if (bPos == null) return -1
              return aPos - bPos
            })
            setSubcategories(sorted)
            setHasSubcategories(sorted.length > 0)
            setShowProducts(false)
          }
          return
        }

        const res = await fetch(`/api/categories?id=${categoryParam}`)
        if (!res.ok) return
        const categoryData = await res.json()
        setCategoryName(categoryData.name)
        setCurrentCategory(categoryData as Category)
        const subcats = categoryData.subcategories || []
        if (subcats.length > 0) {
          const sorted = [...subcats].sort((a: any, b: any) => {
            const aPos = a.position == null ? null : Number(a.position)
            const bPos = b.position == null ? null : Number(b.position)
            const aId = Number(a.id)
            const bId = Number(b.id)
            if (aPos == null && bPos == null) return aId - bId
            if (aPos == null) return 1
            if (bPos == null) return -1
            return aPos - bPos
          })
          setSubcategories(sorted)
          setHasSubcategories(true)
          setShowProducts(false)
        } else {
          setHasSubcategories(false)
          setShowProducts(true)
        }
      } catch (error) {
        console.error("Ошибка при загрузке категорий:", error)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategoryData()
  }, [categoryParam])

  // Путь категории для хлебных крошек
  useEffect(() => {
    const getCategoryPath = async () => {
      if (!categoryParam) {
        setCategoryPath([])
        return
      }
      try {
        const res = await fetch(`/api/categories?pathFor=${categoryParam}`)
        if (res.ok) {
          const path = await res.json()
          setCategoryPath(path)
          if (path.length > 0) {
            setCategoryName(path[path.length - 1].name)
          }
        }
      } catch (e) {
        console.error("Ошибка загрузки пути категории:", e)
      }
    }
    getCategoryPath()
  }, [categoryParam])

  // Загружаем все товары при первом рендере или изменении категории
  useEffect(() => {
    if (showProducts) {
      fetchProducts()
    } else {
      setIsLoading(false)
    }
  }, [categoryParam, showProducts])

  // Обновляем отфильтрованные товары при изменении фильтров или поискового запроса
  useEffect(() => {
    if (allProducts.length > 0 && showProducts) {
      applyFilters()
    }
  }, [activeFilters, sortOrder, searchQuery, allProducts, showProducts])

  // Обновляем фильтры при изменении параметра категории
  useEffect(() => {
    if (categoryParam) {
      setActiveFilters((prev) => ({
        ...prev,
        categories: [categoryParam],
      }))
    }
  }, [categoryParam])

  // Пагинация
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const total = Math.ceil(filteredProducts.length / itemsPerPage)
      setTotalPages(total)

      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setPaginatedProducts(filteredProducts.slice(startIndex, endIndex))
    } else {
      setPaginatedProducts([])
      setTotalPages(1)
    }
  }, [filteredProducts, currentPage])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryParam) params.set("category", categoryParam)
      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) throw new Error("Ошибка загрузки товаров")
      const typedData = (await res.json()) as Product[]
      setAllProducts(typedData)
      applyFilters(typedData)
    } catch (error) {
      console.error("Ошибка при загрузке товаров:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = (products = allProducts) => {
    setIsLoading(true)
    let filteredData = [...products]

    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredData = filteredData.filter(
        (product) => product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query),
      )
    }

    // Фильтрация по характеристикам (ключи фильтров — канонические, рус./англ. дубли объединены)
    const characteristicFilters = Object.entries(activeFilters).filter(([key]) => key !== "categories")

    if (characteristicFilters.length > 0) {
      filteredData = filteredData.filter((product) => {
        const normalized = effectiveCharacteristics(product)
        return characteristicFilters.every(([key, values]) => {
          // Если фильтр пустой, пропускаем проверку
          if (values.length === 0) return true

          // Если у товара нет такой характеристики — не проходит фильтр
          const productValue = normalized[key]
          if (productValue === undefined) return false

          return values.some((v) => valuesEqual(v, productValue))
        })
      })
    }

    // Сортировка товаров
    filteredData = sortProducts(filteredData, sortOrder)
    setFilteredProducts(filteredData)

    // Обновляем пагинацию
    const total = Math.ceil(filteredData.length / itemsPerPage)
    setTotalPages(total)

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedProducts(filteredData.slice(startIndex, endIndex))

    setIsLoading(false)
  }

  const sortProducts = (products: Product[], order: string) => {
    const sorted = [...products]
    switch (order) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price)
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      default:
        return sorted
    }
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    // Используем setTimeout чтобы избежать ошибки обновления состояния во время рендеринга
    setTimeout(() => {
      setActiveFilters(newFilters)

      // При изменении фильтров возвращаемся на первую страницу
      if (currentPage !== 1) {
        navigateToPage(1)
      }
    }, 0)
  }

  const handleSort = (order: "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc") => {
    setSortOrder(order)
  }

  const handleSearch = () => {
    const params = new URLSearchParams(window.location.search)
    if (localSearchQuery) {
      params.set("search", localSearchQuery)
    } else {
      params.delete("search")
    }

    // При поиске возвращаемся на первую страницу
    params.set("page", "1")

    router.push(`/catalog?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const emptyFilters: FilterOptions = { categories: categoryParam ? [categoryParam] : [] }
    setActiveFilters(emptyFilters)
    setLocalSearchQuery("")

    // Очищаем search параметр в URL
    const params = new URLSearchParams(window.location.search)
    params.delete("search")
    params.set("page", "1")

    if (categoryParam) {
      router.push(`/catalog?category=${categoryParam}&page=1`)
    } else {
      router.push("/catalog?page=1")
    }
  }

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", page.toString())
    router.push(`/catalog?${params.toString()}`)
  }

  const pageTitle = React.useMemo(() => {
    if (categoryName) return categoryName
    if (searchQuery) return `Поиск: ${searchQuery}`
    return "Каталог товаров"
  }, [categoryName, searchQuery])

  // Функция для сохранения предпочтений пользователя
  const saveViewPreference = (mode: "grid" | "list") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("catalog-view-mode", mode)
    }
  }

  // Загрузка предпочтений пользователя при инициализации
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("catalog-view-mode") as "grid" | "list"
      if (savedMode) {
        setViewMode(savedMode)
      }
    }
  }, [])

  // Функция для переключения режима отображения
  const toggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode)
    saveViewPreference(mode)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Хлебные крошки */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/catalog">Каталог</BreadcrumbLink>
          </BreadcrumbItem>

          {categoryPath.map((category, index) => (
            <React.Fragment key={category.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === categoryPath.length - 1 ? (
                  <span>{category.name}</span>
                ) : (
                  <BreadcrumbLink href={`/catalog?category=${category.id}`}>{category.name}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}

          {searchQuery && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span>Поиск: {searchQuery}</span>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">{pageTitle}</h1>

          {showProducts && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-xs">
                <Input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pr-10"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              <Select value={sortOrder} onValueChange={(value: any) => handleSort(value)}>
                <SelectTrigger className="w-auto whitespace-nowrap">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">По умолчанию</SelectItem>
                  <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                  <SelectItem value="price-desc">Сначала дороже</SelectItem>
                  <SelectItem value="name-asc">По названию (А-Я)</SelectItem>
                  <SelectItem value="name-desc">По названию (Я-А)</SelectItem>
                </SelectContent>
              </Select>

              {/* Кнопки переключения режима отображения */}
              <div className="hidden sm:flex border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-r-none ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  onClick={() => toggleViewMode('grid')}
                  title="Отображать плиткой"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-l-none border-l ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  onClick={() => toggleViewMode('list')}
                  title="Отображать списком"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Мобильная панель фильтров */}
        {useMobileFilters && showProducts && (
          <div className="mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-between">
                  <span className="flex items-center">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Фильтры
                    {totalFiltersCount > 0 && (
                      <Badge className="ml-2 bg-green-600">{totalFiltersCount}</Badge>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <DynamicFilterSidebar
                  onFilterChange={handleFilterChange}
                  initialFilters={activeFilters}
                  selectedCategoryId={categoryParam}
                  hideTitle={true}
                />
              </SheetContent>
            </Sheet>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Боковая панель с фильтрами (только если показываем товары) */}
          {!useMobileFilters && showProducts && (
            <div className="w-full lg:w-64 flex-shrink-0">
              <DynamicFilterSidebar
                onFilterChange={handleFilterChange}
                initialFilters={activeFilters}
                selectedCategoryId={categoryParam}
              />
            </div>
          )}

          <div className="flex-1">
            {/* Отображение активных фильтров в десктопной версии (только если показываем товары) */}
            {(totalFiltersCount > 0 || searchQuery) && !useMobileFilters && showProducts && (
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                <span className="text-sm text-gray-500">Активные фильтры:</span>

                {searchQuery && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    Поиск: {searchQuery}
                    <button
                      onClick={() => {
                        setLocalSearchQuery("")
                        const params = new URLSearchParams(window.location.search)
                        params.delete("search")
                        params.set("page", "1")

                        if (categoryParam) {
                          router.push(`/catalog?category=${categoryParam}&page=1`)
                        } else {
                          router.push("/catalog?page=1")
                        }
                      }}
                      className="ml-1"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                )}

                {Object.entries(activeFilters).flatMap(([key, values]) =>
                  key !== "categories" && values.length > 0
                    ? values.map((value) => (
                        <Badge
                          key={`${key}-${value}`}
                          variant="outline"
                          className="bg-green-50 text-green-800 border-green-200"
                        >
                          {formatKey(key)}: {value}
                          <button
                            onClick={() => {
                              const newFilters = { ...activeFilters }
                              newFilters[key] = newFilters[key].filter((v) => v !== value)
                              handleFilterChange(newFilters)
                            }}
                            className="ml-1"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))
                    : [],
                )}

                {(totalFiltersCount > 0 || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-gray-500 ml-auto hover:text-gray-900"
                    onClick={clearAllFilters}
                  >
                    Сбросить всё
                  </Button>
                )}
              </div>
            )}

            {/* Отображаем подкатегории или корневые категории */}
            {!showProducts && (
              <div className="space-y-6">
          

                {loadingCategories ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <CategorySkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subcategories.map((subcat) => (
                      <CategoryCard
                        key={subcat.id}
                        id={subcat.id}
                        name={subcat.name}
                        description={subcat.description}
                        imageUrl={subcat.image_url}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Отображение товаров */}
            {showProducts &&
              (isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <Skeleton className="h-64 w-full" />
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : paginatedProducts.length > 0 ? (
                <>
                  <div className="text-sm text-gray-500 mb-4">
                    Найдено товаров: <span className="font-semibold text-gray-800">{filteredProducts.length}</span>
                  </div>
                  
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {paginatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} viewMode="grid" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {paginatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} viewMode="list" />
                      ))}
                    </div>
                  )}

                  {/* Пагинация */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigateToPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Показываем только текущую страницу, первую, последнюю и соседние
                          if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                className={currentPage === page ? "bg-green-600 hover:bg-green-700" : ""}
                                onClick={() => navigateToPage(page)}
                              >
                                {page}
                              </Button>
                            )
                          }

                          // Добавляем многоточие между страницами
                          if (
                            (page === 2 && currentPage > 3) ||
                            (page === totalPages - 1 && currentPage < totalPages - 2)
                          ) {
                            return <span key={page}>...</span>
                          }

                          return null
                        })}

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigateToPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Товары не найдены</h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    К сожалению, по вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или фильтры.
                  </p>
                  <Button onClick={clearAllFilters} className="bg-green-600 hover:bg-green-700">
                    Сбросить все фильтры
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
