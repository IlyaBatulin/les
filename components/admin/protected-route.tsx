"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import AdminLayout from "./admin-layout"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return <AdminLayout>{children}</AdminLayout>
}
