import { checkAdminSession } from "@/lib/admin-auth"
import type { ReactNode } from "react"
import { AuthProvider } from "@/components/admin/auth-provider"

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AuthProvider initialAuthenticated={await checkAdminSession()}>
      {/* Проверка на страницу логина происходит внутри компонентов */}
      {children}
    </AuthProvider>
  )
}
