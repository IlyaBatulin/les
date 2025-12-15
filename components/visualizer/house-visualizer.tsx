"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const HouseVisualizer = () => {
  const [activeView, setActiveView] = useState("day")

  return (
    <div className="bg-green-600 text-white p-8 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Интерактивная модель дома</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeView === "day" ? "secondary" : "ghost"}
            className={activeView === "day" ? "bg-white/20 hover:bg-white/30" : "hover:bg-white/10"}
            onClick={() => setActiveView("day")}
          >
            День
          </Button>
          <Button
            size="sm"
            variant={activeView === "sunset" ? "secondary" : "ghost"}
            className={activeView === "sunset" ? "bg-white/20 hover:bg-white/30" : "hover:bg-white/10"}
            onClick={() => setActiveView("sunset")}
          >
            Закат
          </Button>
          <Button
            size="sm"
            variant={activeView === "night" ? "secondary" : "ghost"}
            className={activeView === "night" ? "bg-white/20 hover:bg-white/30" : "hover:bg-white/10"}
            onClick={() => setActiveView("night")}
          >
            Ночь
          </Button>
        </div>
      </div>
      <p className="text-white/80 mb-4">
        Просмотрите различные части дома, чтобы узнать о подходящих материалах и решениях
      </p>
      <motion.div
        className="h-40 bg-green-700/50 rounded flex items-center justify-center"
        initial={{ opacity: 0.8 }}
        animate={{
          opacity: 1,
          background:
            activeView === "day"
              ? "linear-gradient(to bottom, #4ade80, #16a34a)"
              : activeView === "sunset"
                ? "linear-gradient(to bottom, #f97316, #7c2d12)"
                : "linear-gradient(to bottom, #1e293b, #0f172a)",
        }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="outline" className="border-white text-white">
          3D вид
        </Button>
      </motion.div>
    </div>
  )
}

export default HouseVisualizer
