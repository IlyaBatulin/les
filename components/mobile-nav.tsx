"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ChevronRight, ChevronDown, AlertCircle, X } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// Используем тот же тип Category, что и в header.tsx
type Category = {
  id: number
  name: string
  parent_id: number | null
  description?: string | null
  image_url?: string | null
}

type MobileNavProps = {
  categories?: Category[]
  menuIconClassName?: string
}

export function MobileNav({ categories: propCategories, menuIconClassName = "" }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>(propCategories || [])
  const [subCategories, setSubCategories] = useState<Record<number, Category[]>>({})
  const [activeCategories, setActiveCategories] = useState<number[]>([])
  const router = useRouter()

  // Загрузка категорий, если они не переданы через пропсы
  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories)
      return
    }

    const fetchCategories = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        const { data } = await supabase
          .from("categories")
          .select("id, name, parent_id")
          .is("parent_id", null)
          .order("name")
        
        if (data) {
          setCategories(data.map(cat => ({
            id: Number(cat.id),
            name: String(cat.name),
            parent_id: null
          })))
        }
      } catch (error) {
        console.error("Ошибка при загрузке категорий:", error)
      }
    }
    
    fetchCategories()
  }, [propCategories])

  // Загрузка подкатегорий при раскрытии категории
  const loadSubcategories = async (categoryId: number) => {
    // Если подкатегории уже загружены, просто переключаем видимость
    if (subCategories[categoryId]) {
      toggleCategory(categoryId)
      return
    }

    try {
      const supabase = createClientSupabaseClient()
      
      const { data } = await supabase
        .from("categories")
        .select("id, name, parent_id")
        .eq("parent_id", categoryId)
        .order("name")
      
      if (data && data.length > 0) {
        // Исправляем ошибку типов, явно приводя к типу Category[]
        const formattedData: Category[] = data.map(cat => ({
          id: Number(cat.id),
          name: String(cat.name),
          parent_id: Number(cat.parent_id)
        }));
        
        setSubCategories(prev => ({
          ...prev,
          [categoryId]: formattedData
        }))
        toggleCategory(categoryId)
      } else {
        // Если подкатегорий нет, переходим на страницу категории
        router.push(`/catalog?category=${categoryId}`)
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Ошибка при загрузке подкатегорий:", error)
    }
  }

  // Переключение видимости категории
  const toggleCategory = (categoryId: number) => {
    setActiveCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Обработчик клика на категорию
  const handleCategoryClick = (categoryId: number) => {
    // Проверяем, есть ли у категории подкатегории
    if (subCategories[categoryId] && subCategories[categoryId].length > 0) {
      toggleCategory(categoryId)
    } else {
      // Загружаем подкатегории или переходим на страницу категории
      loadSubcategories(categoryId)
    }
  }

  return (
    <div>
      <Button 
        variant="ghost" 
        size="icon" 
        className={menuIconClassName} 
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Фон с затемнением */}
      <div 
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Панель меню */}
      <div 
        className={`fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-lg z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-green-600">Меню</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <Link 
            href="/catalog" 
            className="block py-2 text-gray-800 hover:text-green-600"
            onClick={() => setIsOpen(false)}
          >
            <h3 className="font-medium mb-2">Категории</h3>
          </Link>
          
          <div className="py-2 border-t border-gray-200 mt-2">
            
            <div className="space-y-1">
              {categories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <div 
                    className="flex items-center justify-between py-2 cursor-pointer hover:text-green-600"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <span>{category.name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${activeCategories.includes(category.id) ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {activeCategories.includes(category.id) && subCategories[category.id] && (
                    <div className="pl-4 border-l border-gray-200 ml-2 space-y-1">
                      {subCategories[category.id].map((subCategory) => (
                        <div key={subCategory.id} className="space-y-1">
                          <div 
                            className="flex items-center justify-between py-2 cursor-pointer hover:text-green-600"
                            onClick={() => handleCategoryClick(subCategory.id)}
                          >
                            <span>{subCategory.name}</span>
                            {subCategories[subCategory.id] && subCategories[subCategory.id].length > 0 && (
                              <ChevronDown className={`h-4 w-4 transition-transform ${activeCategories.includes(subCategory.id) ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                          
                          {activeCategories.includes(subCategory.id) && subCategories[subCategory.id] && (
                            <div className="pl-4 border-l border-gray-200 ml-2 space-y-1">
                              {subCategories[subCategory.id].map((thirdLevel) => (
                                <Link 
                                  key={thirdLevel.id}
                                  href={`/catalog?category=${thirdLevel.id}`}
                                  className="block py-2 hover:text-green-600"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {thirdLevel.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
            <Link 
              href="/delivery" 
              className="block py-2 text-gray-800 hover:text-green-600"
              onClick={() => setIsOpen(false)}
            >
              Доставка
            </Link>
            <Link 
              href="/contacts" 
              className="block py-2 text-gray-800 hover:text-green-600"
              onClick={() => setIsOpen(false)}
            >
              Контакты
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
