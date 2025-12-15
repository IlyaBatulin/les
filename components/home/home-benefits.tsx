"use client"

import { motion } from "framer-motion"
import { Truck, Package, Clock, Phone, Shield, BadgeCheck } from "lucide-react"

const benefits = [
  {
    icon: <Truck className="h-8 w-8 text-green-600" />,
    title: "Быстрая доставка",
    description: "Доставляем товары в течение 1-3 дней по всему региону"
  },
  {
    icon: <Shield className="h-8 w-8 text-green-600" />,
    title: "Гарантия качества",
    description: "Все товары проходят строгий контроль качества"
  },
  {
    icon: <BadgeCheck className="h-8 w-8 text-green-600" />,
    title: "Сертифицированные материалы",
    description: "Используем только проверенные и экологичные материалы"
  },
  {
    icon: <Clock className="h-8 w-8 text-green-600" />,
    title: "Работаем 24/7",
    description: "Оформляйте заказы в любое удобное для вас время"
  }
]

const HomeBenefits = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Почему выбирают нас</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="rounded-full bg-green-100 p-4 mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomeBenefits
