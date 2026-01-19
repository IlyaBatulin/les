import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CookieConsent from "@/components/cookie-consent"
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "@/components/ui/toaster"
import ReactQueryProvider from "@/components/ReactQueryProvider"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

// Metadata для SEO и социальных сетей
export const metadata: Metadata = {
  title: {
    default: "ВЫБОР+ | Пиломатериалы",
    template: "%s | ВЫБОР+"
  },
  description: "Категории. ВЫБОР+. Ваш надежный поставщик пиломатериалов высокого качества с доставкой. От фундамента до кровли - все материалы для вашего строительства.",
  keywords: "пиломатериалы, доски, брус, стройматериалы, Москва, доставка",
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
    shortcut: '/favicon.ico'
  },
  generator: 'v0.dev',
  openGraph: {
    title: "ВЫБОР+ | Пиломатериалы",
    description: "Категории. ВЫБОР+. Ваш надежный поставщик пиломатериалов высокого качества с доставкой.",
    type: "website",
    url: "https://vyborplus.ru",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ReactQueryProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <CookieConsent />
            <Toaster />
          </CartProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
