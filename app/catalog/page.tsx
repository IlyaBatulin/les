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
import { createClientSupabaseClient } from "@/lib/supabase"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CategorySkeleton } from '@/components/ui/category-skeleton'
import { useMediaQuery } from "@/hooks/use-media-query"

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

  // Загружаем имена категорий для отображения в фильтрах
  useEffect(() => {
    const loadCategoryNames = async () => {
      const supabase = createClientSupabaseClient()
      const { data } = await supabase.from("categories").select("id, name")

      if (data) {
        const namesMap: Record<string, string> = {}
        data.forEach((cat) => {
          namesMap[(cat.id as number).toString()] = cat.name as string
        })
        setCategoryNames(namesMap)
      }
    }

    loadCategoryNames()
  }, [])

  // Загружаем количество товаров в каждой категории
  useEffect(() => {
    const loadCategoryCounts = async () => {
      const supabase = createClientSupabaseClient()
      const { data: products } = await supabase.from("products").select("category_id")

      if (products) {
        const counts: Record<number, number> = {}
        products.forEach((product) => {
          const categoryId = product.category_id as number;
          counts[categoryId] = (counts[categoryId] || 0) + 1
        })
        setCategoryProductCounts(counts)
      }
    }

    loadCategoryCounts()
  }, [])

  // Находим useEffect, который загружает подкатегории
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categoryParam) {
        // Если категория не выбрана, загружаем все основные категории
        setLoadingCategories(true); // Устанавливаем состояние загрузки
        try {
          const supabase = createClientSupabaseClient();
          const { data } = await supabase
            .from("categories")
            .select("*")
            .is("parent_id", null)
            .order("position", { ascending: true })
            .order("name");
          
          if (data) {
            // Сортировка по position, если есть, иначе по id
            const sorted = data.sort((a, b) => {
              const aPos = a.position == null ? null : Number(a.position)
              const bPos = b.position == null ? null : Number(b.position)
              const aId = Number(a.id)
              const bId = Number(b.id)
              if (aPos == null && bPos == null) return aId - bId
              if (aPos == null) return 1
              if (bPos == null) return -1
              return aPos - bPos
            })
            setSubcategories(sorted);
            setHasSubcategories(sorted.length > 0);
            setShowProducts(false);
          }
        } catch (error) {
          console.error("Ошибка при загрузке категорий:", error);
        } finally {
          setLoadingCategories(false); // Завершаем загрузку
        }
        return;
      }

      // Если категория выбрана
      setLoadingCategories(true); // Устанавливаем состояние загрузки
      try {
        const supabase = createClientSupabaseClient();
        
        // Получаем информацию о текущей категории
        const { data: categoryData } = await supabase
          .from("categories")
          .select("*")
          .eq("id", categoryParam)
          .single();
        
        if (categoryData) {
          setCategoryName(categoryData.name as string);
          setCurrentCategory(categoryData as unknown as Category);
          
          // Проверяем наличие подкатегорий
          const { data: subcats } = await supabase
            .from("categories")
            .select("*")
            .eq("parent_id", categoryParam)
            .order("position", { ascending: true })
            .order("name");
          
          if (subcats && subcats.length > 0) {
            // Сортировка по position, если есть, иначе по id
            const sorted = subcats.sort((a, b) => {
              const aPos = a.position == null ? null : Number(a.position)
              const bPos = b.position == null ? null : Number(b.position)
              const aId = Number(a.id)
              const bId = Number(b.id)
              if (aPos == null && bPos == null) return aId - bId
              if (aPos == null) return 1
              if (bPos == null) return -1
              return aPos - bPos
            })
            setSubcategories(sorted);
            setHasSubcategories(true);
            setShowProducts(false);
          } else {
            setHasSubcategories(false);
            setShowProducts(true);
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных категории:", error);
      } finally {
        setLoadingCategories(false); // Завершаем загрузку
      }
    };

    fetchCategoryData();
  }, [categoryParam]);

  // Получаем путь категории для хлебных крошек
  useEffect(() => {
    const getCategoryPath = async () => {
      if (!categoryParam) {
        setCategoryPath([])
        return
      }

      const supabase = createClientSupabaseClient()
      const currentCategoryId = Number(categoryParam)
      const path: { id: number; name: string }[] = []

      // Функция для получения категории и её родителя
      const getCategory = async (id: number) => {
        const { data } = await supabase.from("categories").select("id, name, parent_id").eq("id", id).single()

        if (data) {
          path.unshift({ id: data.id as number, name: data.name as string })
          if (data.parent_id !== null && data.parent_id !== undefined) {
            await getCategory(data.parent_id as number)
          }
        }
      }

      await getCategory(currentCategoryId)
      setCategoryPath(path)

      // Устанавливаем имя текущей категории
      if (path.length > 0) {
        setCategoryName(path[path.length - 1].name)
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
    const supabase = createClientSupabaseClient()

    let query = supabase.from("products").select(`
      *,
      category:categories(id, name)
    `)

    // Если выбрана категория, фильтруем товары на уровне SQL
    if (categoryParam) {
      query = query.eq("category_id", categoryParam)
    }

    const { data, error } = await query

    if (error) {
      console.error("Ошибка при загрузке товаров:", error)
      setIsLoading(false)
      return
    }

    const typedData = data as unknown as Product[]
    setAllProducts(typedData)
    applyFilters(typedData)
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

    // Фильтрация по характеристикам
    const characteristicFilters = Object.entries(activeFilters).filter(([key]) => key !== "categories")

    if (characteristicFilters.length > 0) {
      filteredData = filteredData.filter((product) => {
        return characteristicFilters.every(([key, values]) => {
          // Если у товара нет характеристик или нет такого ключа, он не проходит фильтр
          if (!product.characteristics || !product.characteristics[key as keyof typeof product.characteristics]) {
            return values.length === 0 // Если фильтр пустой, пропускаем товар
          }

          // Если фильтр пустой, пропускаем проверку
          if (values.length === 0) return true

          // Проверяем, содержится ли значение характеристики в списке выбранных значений
          const productValue = String(product.characteristics[key as keyof typeof product.characteristics])
          return values.includes(productValue)
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

// Форматирование ключей характеристик для отображения
function formatKey(key: string): string {
  try {
    // Проверяем, что key является строкой
    if (!key || typeof key !== 'string') {
      return String(key || '')
    }

    // Специальные переводы для английских ключей
    const translations: Record<string, string> = {
      'pieces_per_cubic_meter': 'Штук в м³',
      'pieces per cubic meter': 'Штук в м³',
      'grade': 'Сорт',
      'drying': 'Сушка',
      'wood_type': 'Порода',
      'size': 'Размер',
      'standard': 'Стандарт',
      'thickness': 'Толщина',
      'width': 'Ширина',
      'length': 'Длина',
      'moisture': 'Влажность',
      'surface_treatment': 'Обработка поверхности',
      'purpose': 'Назначение'
    }

    // Проверяем точное совпадение
    if (translations[key.toLowerCase()]) {
      return translations[key.toLowerCase()]
    }

    // Проверяем совпадение с заменой подчеркиваний
    const normalizedKey = key.replace(/_/g, " ").toLowerCase()
    if (translations[normalizedKey]) {
      return translations[normalizedKey]
    }

    // Если нет перевода, форматируем как обычно
    return key
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  } catch (error) {
    console.error('Ошибка в formatKey:', error, 'key:', key)
    return String(key || '')
  }
}
