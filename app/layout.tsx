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

export const metadata: Metadata = {
  title: "ВЫБОР+ | Стройматериалы",
  description: "Больше чем стройматериалы - от фундамента до кровли",
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
    shortcut: '/favicon.ico'
  },
  generator: 'v0.dev'
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
