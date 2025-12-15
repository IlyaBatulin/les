"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Phone, X } from "lucide-react"

export default function FloatingCallButton() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-lg p-4 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Связаться с нами</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-3">Наши специалисты готовы ответить на ваши вопросы</p>
          <div className="space-y-2">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Phone className="h-4 w-4 mr-2" />
              Позвонить
            </Button>
            <Button variant="outline" className="w-full">
              Заказать звонок
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          className="rounded-full h-14 w-14 bg-green-600 hover:bg-green-700 shadow-lg"
          onClick={() => setIsExpanded(true)}
        >
          <Phone className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
