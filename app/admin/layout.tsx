import type { ReactNode } from "react"
import { AuthProvider } from "@/components/admin/auth-provider"

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AuthProvider>
      {/* Проверка на страницу логина происходит внутри компонентов */}
      {children}
    </AuthProvider>
  )
}
