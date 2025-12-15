"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Cookie } from "lucide-react"

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Проверяем, было ли уже дано согласие на cookies
    const hasConsented = localStorage.getItem("cookieConsent")
    if (!hasConsented) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true")
    setShowConsent(false)
  }

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "false")
    setShowConsent(false)
  }

  if (!showConsent) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
              <Cookie className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Мы используем cookies</h3>
              <p className="text-sm text-gray-600">
                Мы используем файлы cookie для улучшения работы сайта, анализа трафика и персонализации контента. 
                Продолжая использовать сайт, вы соглашаетесь с использованием файлов cookie.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={declineCookies}
              className="text-gray-600 hover:text-gray-800"
            >
              Отклонить
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Принять
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={declineCookies}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 