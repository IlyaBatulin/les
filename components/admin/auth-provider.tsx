"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

// Определение структуры контекста авторизации
type AuthContextType = {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

// Создание контекста с дефолтными значениями
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
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

  // Функция входа
  const login = (username: string, password: string) => {
    // Проверка учетных данных (в реальном приложении это должен быть API-запрос)
    if (username === "admin" && password === "admin123") {
      // Создаем простой токен
      const token = Date.now().toString()
      // Сохраняем токен в localStorage
      localStorage.setItem("admin_auth_token", token)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  // Функция выхода
  const logout = () => {
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
