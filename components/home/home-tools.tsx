"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Settings } from "lucide-react"
import PriceCalculator from "@/components/calculator/price-calculator"
import HouseVisualizer from "@/components/visualizer/house-visualizer"

const HomeTools = () => {
  const [activeTab, setActiveTab] = useState<string>("visualizer")

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="text-center mb-6">
            <h2 className="inline-block text-2xl md:text-3xl font-bold text-gray-800 mb-2 relative">
              Инструменты для расчета и визуализации
              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 opacity-75 rounded"></div>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Воспользуйтесь нашими интерактивными инструментами, чтобы рассчитать стоимость материалов и визуально
              подобрать их для вашего дома
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="bg-white border shadow-sm">
                <TabsTrigger
                  value="calculator"
                  className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 px-6 flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Калькулятор
                </TabsTrigger>
                <TabsTrigger
                  value="visualizer"
                  className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 px-6 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Конструктор дома
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="calculator" className="mt-0">
              <div className="flex justify-center">
                <PriceCalculator />
              </div>
            </TabsContent>

            <TabsContent value="visualizer" className="mt-0">
              <HouseVisualizer />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}

export default HomeTools
