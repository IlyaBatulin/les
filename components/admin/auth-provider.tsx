"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

// Определение структуры контекста авторизации
type AuthContextType = {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

// Создание контекста с дефолтными значениями
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
})

// Хук для использования контекста авторизации
export const useAuth = () => useContext(AuthContext)

// Провайдер авторизации
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Добавляем состояние загрузки
  const router = useRouter()
  const pathname = usePathname()

  // Проверка авторизации при монтировании компонента
  useEffect(() => {
    const checkAuth = () => {
      // Получаем токен из localStorage
      const authToken = localStorage.getItem("admin_auth_token")
      setIsAuthenticated(!!authToken)
      setIsLoading(false) // Загрузка завершена
    }

    // Проверяем авторизацию
    checkAuth()
  }, [])

  // Эффект для редиректа на страницу логина
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [isAuthenticated, pathname, router, isLoading])

  // Функция входа — проверка на сервере через API
  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        localStorage.setItem("admin_auth_token", "1")
        setIsAuthenticated(true)
        return true
      }
    } catch {
      // ignore
    }
    return false
  }

  // Функция выхода
  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } catch {
      // ignore
    }
    localStorage.removeItem("admin_auth_token")
    setIsAuthenticated(false)
    router.push("/admin/login")
  }

  // Отображаем спиннер во время загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Отображаем страницу логина или дочерние компоненты
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
