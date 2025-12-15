"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

type Testimonial = {
  id: number;
  name: string;
  position?: string;
  message: string;
  rating: number;
  image_url?: string;
}

export default function HomeTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
        const supabase = createClientSupabaseClient()
        
        const { data } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (data) {
          setTestimonials(data as Testimonial[])
        } else {
          // Используем демо-отзывы если нет данных
          setTestimonials(getDemoTestimonials())
        }
      } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error)
        // Используем демо-отзывы при ошибке
        setTestimonials(getDemoTestimonials())
      } finally {
        setLoading(false)
      }
    }
    
    fetchTestimonials()
  }, [])

  // Вынесем демо-отзывы в отдельную функцию
  const getDemoTestimonials = (): Testimonial[] => [
    {
      id: 1,
      name: "Иван Петров",
      position: "Прораб",
      message: "Работаем с ВЫБОР+ уже более 2 лет. Всегда отличное качество материалов и своевременная доставка. Очень доволен сотрудничеством!",
      rating: 5,
      image_url: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      id: 2,
      name: "Анна Иванова",
      position: "Дизайнер интерьеров",
      message: "Заказывала пиломатериалы для своего проекта. Качество превзошло все ожидания. Буду рекомендовать своим клиентам!",
      rating: 5,
      image_url: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
      id: 3,
      name: "Сергей Смирнов",
      position: "Частный застройщик",
      message: "Построил дом полностью из материалов от ВЫБОР+. Отличное соотношение цены и качества, приятно иметь дело с профессионалами.",
      rating: 4,
      image_url: "https://randomuser.me/api/portraits/men/3.jpg"
    }
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  if (loading || testimonials.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Отзывы наших клиентов</h2>
          <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Отзывы наших клиентов</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <button 
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              aria-label="Предыдущий отзыв"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>

            <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-500">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <Image
                      src={testimonials[currentIndex].image_url || 'https://via.placeholder.com/150'}
                      alt={testimonials[currentIndex].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`h-5 w-5 ${i < testimonials[currentIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 text-lg italic mb-4">
                    "{testimonials[currentIndex].message}"
                  </blockquote>
                  
                  <div>
                    <p className="font-semibold text-gray-800">{testimonials[currentIndex].name}</p>
                    {testimonials[currentIndex].position && (
                      <p className="text-gray-500">{testimonials[currentIndex].position}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              aria-label="Следующий отзыв"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </div>
          
          <div className="flex justify-center mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`mx-1 w-3 h-3 rounded-full ${i === currentIndex ? 'bg-green-600' : 'bg-gray-300'}`}
                aria-label={`Перейти к отзыву ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 