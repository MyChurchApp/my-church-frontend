"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: string
  accessLevel: string
  identifier?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const router = useRouter()

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return false

    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("userRole")

    if (!token) {
      setIsAuthenticated(false)
      setUser(null)
      setIsLoading(false)
      setHasChecked(true)
      return false
    }

    try {
      // Decodificar o JWT para obter informações do usuário
      const payload = JSON.parse(atob(token.split(".")[1]))

      // Verificar se o token não expirou
      const currentTime = Date.now() / 1000
      if (payload.exp && payload.exp < currentTime) {
        // Token expirado
        logout()
        return false
      }

      const userData: User = {
        id: payload.nameid || "1",
        name: payload.name || payload.email || "Usuário",
        email: payload.email || "",
        role: role || "Membro",
        accessLevel: role === "Admin" ? "admin" : "member",
        identifier: payload.email || payload.nameid || "",
      }

      setUser(userData)
      setIsAuthenticated(true)
      setIsLoading(false)
      setHasChecked(true)
      return true
    } catch (error) {
      console.error("Erro ao decodificar token:", error)
      logout()
      return false
    }
  }, [])

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("user")
    }
    setUser(null)
    setIsAuthenticated(false)
    setIsLoading(false)
    setHasChecked(true)
  }, [])

  const redirectToLogin = useCallback(
    (returnUrl?: string) => {
      const loginUrl = returnUrl ? `/login?redirect=${encodeURIComponent(returnUrl)}` : "/login"
      router.push(loginUrl)
    },
    [router],
  )

  const redirectToDashboard = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  const redirectToHome = useCallback(() => {
    router.push("/")
  }, [router])

  // Verificar autenticação apenas uma vez na inicialização
  useEffect(() => {
    if (!hasChecked) {
      checkAuth()
    }
  }, [checkAuth, hasChecked])

  // Escutar mudanças no localStorage (para quando o usuário faz login em outra aba)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken") {
        checkAuth()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [checkAuth])

  return {
    user,
    isLoading,
    isAuthenticated,
    hasChecked,
    checkAuth,
    logout,
    redirectToLogin,
    redirectToDashboard,
    redirectToHome,
  }
}
