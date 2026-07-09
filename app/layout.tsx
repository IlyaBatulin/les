import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CookieConsent from "@/components/cookie-consent"
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "@/components/ui/toaster"
import ReactQueryProvider from "@/components/ReactQueryProvider"
import SmoothScrollProvider from "@/components/smooth-scroll-provider"
import RouteProgressBar from "@/components/route-progress-bar"

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
      <head>
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {
                    if (document.scripts[j].src === r) { return; }
                  }
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=103970776', 'ym');

              ym(103970776, 'init', {
                ssr: true,
                webvisor: true,
                clickmap: true,
                ecommerce: "dataLayer",
                referrer: document.referrer,
                url: location.href,
                accurateTrackBounce: true,
                trackLinks: true
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/103970776"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        <ReactQueryProvider>
          <CartProvider>
            <RouteProgressBar />
            <SmoothScrollProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <CookieConsent />
              <Toaster />
            </SmoothScrollProvider>
          </CartProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
