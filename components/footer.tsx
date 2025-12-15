"use client"

import Link from "next/link"
import { MapPin, Phone, Mail } from "lucide-react"
import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"

type Category = {
  id: number;
  name: string;
  slug?: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const supabase = createClientSupabaseClient()
        
        // Проверяем подключение к Supabase
        console.log("Supabase клиент инициализирован:", !!supabase)
        
        try {
          // Получаем основные категории (верхнего уровня)
          const { data, error } = await supabase
            .from("categories")
            .select("id, name, position")
            .is("parent_id", null)
            .order("position", { ascending: true })
            .limit(5)  // Ограничиваем до 5 категорий
          
          if (error) {
            console.error("Ошибка Supabase:", error.message, error.code, error.details)
            // Используем фиктивные категории при ошибке
            useFallbackCategories()
            return
          }
          
          if (data && data.length > 0) {
            console.log("Загруженные категории:", data)
            const categoriesWithSlug = data.map((category: any) => ({
              ...category,
              slug: category.name.toLowerCase().replace(/\s+/g, '-')
            }));
            setCategories(categoriesWithSlug as Category[])
          } else {
            console.log("Категории не найдены или пустой массив")
            // Если категорий нет, используем фиктивные
            useFallbackCategories()
          }
        } catch (supabaseError) {
          console.error("Ошибка при выполнении запроса к Supabase:", supabaseError)
          useFallbackCategories()
        }
      } catch (error) {
        console.error("Общая ошибка при загрузке категорий:", error)
        useFallbackCategories()
      } finally {
        setLoading(false)
      }
    }
    
    // Функция для установки фиктивных категорий
    const useFallbackCategories = () => {
      setCategories([
        { id: 1, name: "Пиломатериалы" },
        { id: 2, name: "Стройматериалы" },
        { id: 3, name: "Метизы" },
        { id: 4, name: "Инструменты" },
        { id: 5, name: "Лакокрасочные материалы" }
      ])
    }
    
    fetchCategories()
  }, [])

  // Проверка наличия категорий для отладки
  useEffect(() => {
    console.log("Текущие категории:", categories)
  }, [categories])

  return (
    <footer className="bg-gray-100 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-brand mr-2 mt-0.5" />
                <span className="text-gray-600">
                  119620 г. Москва, вн.тер.г. муниципальный округ Солнцево, ул. Щорса, д. 2, помещ. 2/1
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-brand mr-2" />
                <a href="tel:+7 (495) 077-97-79" className="text-gray-600 hover:text-brand">
                  +7 (495) 077-97-79 <span className="text-xs text-gray-500 ml-2">отдел продаж</span>
                </a>
                
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-brand mr-2" />
                <a href="tel:+7 (926) 777-97-79" className="text-gray-600 hover:text-brand">
                  +7 (926) 777-97-79 <span className="text-xs text-gray-500 ml-2"></span>
                </a>
                <div className="flex ml-2 space-x-2">
                  <a href="https://wa.me/79267779779" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                  <a href="https://t.me/+79267779779" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-brand mr-2" />
                <a href="mailto:zakaz@vyborplus.ru" className="text-gray-600 hover:text-brand">
                  zakaz@vyborplus.ru
                </a>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-brand mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16V4a2 2 0 012-2h8a2 2 0 012 2v12m-6 4h6m-3-4v4m-6-4h6" /></svg>
                <a href="/Реквизиты.pdf" download className="text-gray-600 hover:text-brand">
                  Реквизиты (PDF)
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-gray-600 text-sm">
                Время работы: 9:00-18:00, Пн-Вс
              </p>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-brand">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-gray-600 hover:text-brand">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-gray-600 hover:text-brand">
                  Доставка
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-gray-600 hover:text-brand">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-brand">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/offer" className="text-gray-600 hover:text-brand">
                  Публичная оферта
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Категории</h3>
            {loading ? (
              <ul className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <li key={i}>
                    <div className="bg-gray-200 h-5 w-32 rounded animate-pulse"></div>
                  </li>
                ))}
              </ul>
            ) : categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.map(category => (
                  <li key={category.id}>
                    <Link 
                      href={`/catalog?category=${category.id}`} 
                      className="text-gray-600 hover:text-brand"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/catalog" className="text-green-600 hover:text-green-700 font-medium">
                    Все категории →
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2">
                <li>
                  <Link href="/catalog?category=1" className="text-gray-600 hover:text-brand">
                    Пиломатериалы
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=2" className="text-gray-600 hover:text-brand">
                    Стройматериалы
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=3" className="text-gray-600 hover:text-brand">
                    Метизы
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=4" className="text-gray-600 hover:text-brand">
                    Инструменты
                  </Link>
                </li>
                <li>
                  <Link href="/catalog" className="text-green-600 hover:text-green-700 font-medium">
                    Все категории →
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/logo.png" 
                alt="ВЫБОР+" 
                className="h-12 mr-3" 
              />
              <h3 className="text-xl font-bold text-brand">ВЫБОР+</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Ваш надежный поставщик строительных материалов высокого качества с доставкой.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {currentYear} ВЫБОР+. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
