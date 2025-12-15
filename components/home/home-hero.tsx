"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const HomeHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const images = [
    "/1.jpg",
    "/2.jpg", 
    "/3.jpg",
    "/4.jpg",
    "/5.jpg",
    "/6.jpg",
    "/7.jpg",
  ]

  // Автоматическое переключение слайдов
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 5000) // Переключение каждые 5 секунд

    return () => clearInterval(timer)
  }, [images.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className="relative bg-gradient-to-r from-green-800 to-green-600 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/lumber-yard.png')] opacity-10 bg-cover bg-center"></div>
      <div className="container mx-auto py-8 md:py-16 px-4 flex flex-col md:flex-row items-center relative z-10">
        <motion.div
          className="w-full md:w-1/2 mb-6 md:mb-0 text-center md:text-left"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Больше чем стройматериалы</h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 max-w-lg mx-auto md:mx-0">
            От фундамента до кровли - все материалы для вашего строительства с доставкой по всему региону.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button
              asChild
              size="lg"
              className="bg-white text-green-800 hover:bg-gray-100 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Link href="/catalog">Перейти в каталог</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white text-green-800 hover:bg-gray-100 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Link href="/contacts">Связаться с нами</Link>
            </Button>
          </div>
        </motion.div>
        <motion.div
          className="w-full md:w-1/2 px-4 md:px-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative rounded-lg overflow-hidden shadow-2xl">
            {/* Слайдер */}
            <div className="relative h-[250px] sm:h-[300px] md:h-[400px]">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Слайд ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              ))}
              
              {/* Навигационные стрелки */}
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                aria-label="Предыдущий слайд"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                aria-label="Следующий слайд"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              {/* Точки навигации */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide 
                        ? 'bg-white' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Перейти к слайду ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HomeHero
