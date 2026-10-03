"use client"
import { useEffect } from "react"

const COUNTER_ID = 103970776
type Metrika = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number }

// Mounted only on storefront routes. Local previews never send analytics.
export default function SiteAnalytics() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !["vyborplus.ru", "www.vyborplus.ru"].includes(location.hostname)) return
    const target = window as typeof window & { ym?: Metrika }
    if (!target.ym) {
      const queued: Metrika = (...args) => { (queued.a ||= []).push(args) }
      queued.l = Date.now()
      target.ym = queued
    }
    const ym = target.ym
    let active = true
    let initialized = false
    const initialize = () => {
      if (!active || location.pathname === "/admin" || location.pathname.startsWith("/admin/")) return
      ym(COUNTER_ID, "init", { ssr: true, webvisor: true, clickmap: true, ecommerce: "dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce: true, trackLinks: true })
      initialized = true
    }
    let script = document.getElementById("site-metrika") as HTMLScriptElement | null
    if (!script) {
      script = document.createElement("script")
      script.id = "site-metrika"
      script.async = true
      script.src = `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`
      script.addEventListener("load", () => { script!.dataset.loaded = "true" }, { once: true })
      document.head.appendChild(script)
    }
    if (script.dataset.loaded === "true") initialize()
    else script.addEventListener("load", initialize)
    return () => {
      active = false
      script?.removeEventListener("load", initialize)
      // Official SPA teardown: https://yandex.ru/support/metrica/ru/code/counter-spa-setup
      if (initialized) ym(COUNTER_ID, "destruct")
    }
  }, [])
  return null
}
