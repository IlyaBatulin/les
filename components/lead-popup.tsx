"use client"

import { useState, useEffect } from "react"
import { X, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  // Показываем плашку через 20 секунд после загрузки страницы
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 20000)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/email/send-lead-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        alert("Заявка отправлена! Мы свяжемся с вами в ближайшее время.")
      } else {
        throw new Error(data.error || "Ошибка отправки")
      }
    } catch (error) {
      console.error("Ошибка отправки заявки:", error)
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка"
      alert(`Ошибка отправки заявки: ${errorMessage}. Попробуйте позже или свяжитесь с нами по телефону.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {!isSubmitted ? (
          <>
            {/* Заголовок */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Оставьте заявку
              </h2>
              <p className="text-gray-600">
                Мы перезвоним вам в течение 15 минут
              </p>
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Ваше имя"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Input
                  type="tel"
                  placeholder="Телефон"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Email (необязательно)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Textarea
                  placeholder="Сообщение (необязательно)"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? "Отправляем..." : "Отправить заявку"}
              </Button>
            </form>

            {/* Контакты */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone size={16} className="mr-1" />
                  <span>+7 (495) 077-97-79</span>
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="mr-1" />
                  <span>zakaz@vyborplus.ru</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Сообщение об успешной отправке */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Спасибо за заявку!
            </h3>
            <p className="text-gray-600 mb-4">
              Мы свяжемся с вами в ближайшее время
            </p>
            <Button onClick={handleClose} variant="outline">
              Закрыть
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
