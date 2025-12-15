"use client"

import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"

export default function OfferPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/" className="flex items-center text-green-600 hover:text-green-700 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Вернуться на главную
      </Link>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Публичная оферта</h1>
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 text-lg mb-4">
            Обращаем ваше внимание на то, что данный интернет-сайт, а также вся информация о товарах и ценах, предоставленная на нём, носит исключительно информационный характер и ни при каких условиях не является публичной офертой, определяемой положениями Статьи 437 Гражданского кодекса Российской Федерации.
          </p>
          <p className="text-gray-700 text-lg">
            Для получения подробной информации о наличии и стоимости указанных товаров и (или) услуг, обращайтесь по телефону <a href="tel:+74950779779" className="text-green-700 underline">+7 (495) 077-97-79</a>.
          </p>
        </div>
      </div>
    </div>
  )
} 