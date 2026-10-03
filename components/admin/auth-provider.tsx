"use client"
import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react"
import { usePathname } from "next/navigation"

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}
const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, isLoading: true, login: async () => false, logout: async () => {} })
export const useAuth = () => useContext(AuthContext)
export function AuthProvider({ children, initialAuthenticated }: { children: ReactNode; initialAuthenticated: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated)
  const [isLoading, setIsLoading] = useState(false)
  const authVersion = useRef(0)
  const pathname = usePathname()
  const refreshSession = useCallback(async () => {
    const version = authVersion.current
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store", credentials: "include" })
      const data = res.ok ? await res.json() : null
      if (version === authVersion.current) setIsAuthenticated(data?.authenticated === true)
    } catch { if (version === authVersion.current) setIsAuthenticated(false) }
    finally { setIsLoading(false) }
  }, [])
  useEffect(() => { void refreshSession() }, [pathname, refreshSession])
  useEffect(() => {
    window.addEventListener("focus", refreshSession)
    const timer = setInterval(refreshSession, 60000)
    return () => { window.removeEventListener("focus", refreshSession); clearInterval(timer) }
  }, [refreshSession])
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/admin/login") window.location.replace("/admin/login")
  }, [isAuthenticated, isLoading, pathname])
  const login = async (username: string, password: string) => {
    authVersion.current++
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Не удалось войти")
    setIsAuthenticated(data.ok === true)
    authVersion.current++
    return data.ok === true
  }
  const logout = async () => {
    authVersion.current++
    const res = await fetch("/api/admin/logout", { method: "POST" })
    if (!res.ok) throw new Error("Не удалось завершить сеанс. Повторите попытку.")
    window.location.replace("/admin/login")
  }
  return <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>
}
