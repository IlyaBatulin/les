"use client"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CookieConsent from "@/components/cookie-consent"
import SmoothScrollProvider from "@/components/smooth-scroll-provider"
import SiteAnalytics from "@/components/site-analytics"

export default function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return <>{children}</>
  return <SmoothScrollProvider><SiteAnalytics /><Header /><main>{children}</main><Footer /><CookieConsent /></SmoothScrollProvider>
}
