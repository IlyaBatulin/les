"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const HomeCta = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-green-800 to-green-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/warehouse.png')] opacity-10 bg-cover bg-center"></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Нужна консультация по выбору материалов?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto text-green-50">
            Наши специалисты помогут подобрать оптимальные материалы для вашего проекта с учетом всех требований и
            бюджета.
          </p>
          <Button asChild size="lg" className="bg-white text-green-700 hover:bg-gray-100 shadow-lg hover:shadow-xl">
            <Link href="/contacts">Связаться с нами</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default HomeCta
