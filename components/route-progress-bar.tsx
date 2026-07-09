"use client"

import { Suspense, useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar"

function ProgressBarInner() {
  const ref = useRef<LoadingBarRef>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    ref.current?.continuousStart()
    const timeout = setTimeout(() => ref.current?.complete(), 200)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  return <LoadingBar color="#16a34a" height={3} ref={ref} shadow />
}

/** Тонкая зелёная полоса загрузки сверху страницы при переходах между разделами. */
export default function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  )
}
