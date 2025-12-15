"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Clock, Send, Loader2, Building, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ChangeEvent, FormEvent } from "react"
import Empty from "@/components/home/empty"

export default function Contacts() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || !formData.message) {
      toast({
        title: "Ошибка отправки",
        description: "Пожалуйста, заполните обязательные поля",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/email/send-contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        toast({
          title: "Сообщение отправлено",
          description: "Мы свяжемся с вами в ближайшее время",
        })
        setFormData({
          name: "",
          phone: "",
          email: "",
          message: ""
        })
      } else {
        throw new Error("Ошибка при отправке")
      }
    } catch (error) {
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить сообщение. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      {/* Фоновый элемент верхней секции */}
      <div className="absolute top-0 left-0 right-0 h-[320px] bg-gradient-to-br from-green-700 to-green-600 -z-10"></div>
      
      <div className="container mx-auto px-4 pt-12 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">Контакты</h1>
        <p className="text-center text-green-100 mb-12 max-w-2xl mx-auto">
          Свяжитесь с нами любым удобным способом, и мы ответим на все ваши вопросы.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Карточки с контактами */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="h-3 bg-green-600"></div>
            <div className="p-6">
              <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Телефоны</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <a href="tel:+74950779779" className="text-gray-700 hover:text-green-600 transition-colors text-lg">
                      +7 (495) 077-97-79
                    </a>
                    <span className="text-xs text-gray-500">отдел продаж</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href="tel:+79267779779" className="text-gray-700 hover:text-green-600 transition-colors text-lg">
                    +7 (926) 777-97-79
                  </a>
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
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="h-3 bg-green-600"></div>
            <div className="p-6">
              <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Email</h3>
              <a href="mailto:zakaz@vyborplus.ru" className="text-gray-700 hover:text-green-600 transition-colors block text-lg">
                zakaz@vyborplus.ru
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="h-3 bg-green-600"></div>
            <div className="p-6">
              <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Режим работы</h3>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-medium">Пн-Пт:</span> 9:00 - 18:00<br />
                <span className="font-medium">Сб:</span> 10:00 - 16:00<br />
                <span className="font-medium">Вс:</span> выходной
              </p>
            </div>
          </div>
        </div>
        
        {/* Секция с картой и адресом */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <Building className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Наш адрес</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-gray-500 mb-2">Юридический адрес</p>
                  <p className="text-gray-700 text-lg">
                    119620 г. Москва, вн.тер.г. муниципальный округ Солнцево, ул. Щорса, д. 2, помещ. 2/1
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-2">Адрес склада</p>
                  <p className="text-gray-700 text-lg">
                    Московская область, г. Химки, квартал Кирилловка 78
                  </p>
                </div>
              </div>
              
              <Button className="flex items-center gap-2 w-fit bg-green-600 hover:bg-green-700 text-white mt-8" asChild>
                <a href="https://yandex.ru/maps/?pt=37.407241,55.648098&z=16" target="_blank" rel="noopener noreferrer">
                  Построить маршрут <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="lg:col-span-3 h-[400px] lg:h-[500px]">
              <iframe 
                src="https://yandex.ru/map-widget/v1/?um=constructor%3A7cbdae27d2c07e3b1a2dc17d16b8e3d3d4a5fb5d19f9d9c67d4b79c32d7c4c13&amp;source=constructor&amp;scroll=false&amp;ll=37.407241%2C55.648098&amp;z=15&amp;pt=37.407241,55.648098,pm2gnm" 
                width="100%" 
                height="100%" 
                frameBorder="0"
                title="ВЫБОР+ на карте"
                className="border-0"
              ></iframe>
            </div>
          </div>
        </div>
        
        {/* Форма обратной связи */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 bg-gradient-to-br from-green-700 to-green-600 text-white flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">Напишите нам</h2>
              <p className="text-green-100 mb-6">
                Заполните форму, и мы свяжемся с вами в ближайшее время чтобы ответить на все ваши вопросы.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span>+7 (495) 077-97-79</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span>zakaz@vyborplus.ru</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span>г. Москва, вн.тер.г. муниципальный округ Солнцево, ул. Щорса, д. 2, помещ. 2/1</span>
                </div>
              </div>
            </div>
            <div className="p-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
                    Имя <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    id="name" 
                    placeholder="Введите ваше имя" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    id="phone" 
                    placeholder="+7 (___) ___-__-__" 
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
                    Email
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="example@mail.ru" 
                    value={formData.email}
                    onChange={handleChange}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1 text-gray-700">
                    Сообщение <span className="text-red-500">*</span>
                  </label>
                  <Textarea 
                    id="message" 
                    placeholder="Введите ваше сообщение" 
                    rows={4} 
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                      Отправка...
                    </>
                  ) : (
                    "Отправить сообщение"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}
