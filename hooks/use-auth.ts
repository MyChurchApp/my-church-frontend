"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
  document?: string
  phone?: string
  churchId?: number
  isActive?: boolean
  isBaptized?: boolean
  isTither?: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") {
      setIsLoading(false)
      setHasChecked(true)
      return false
    }

    const token = localStorage.getItem("authToken")

    if (token) {
      try {
        // Decodificar o JWT para verificar se ainda é válido
        const payload = JSON.parse(atob(token.split(".")[1]))
        const currentTime = Math.floor(Date.now() / 1000)

        if (payload.exp && payload.exp > currentTime) {
          // Token válido
          setIsAuthenticated(true)

          // Obter informações completas do usuário do localStorage
          const userInfo = localStorage.getItem("user")
          if (userInfo) {
            const parsedUser = JSON.parse(userInfo)
            setUser(parsedUser)
          } else {
            // Fallback usando dados do token
            setUser({
              id: payload.nameid,
              name: payload.name || "Usuário",
              email: payload.email,
              role: payload.role,
            })
          }
        } else {
          // Token expirado
          logout()
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error)
        logout()
      }
    } else {
      setIsAuthenticated(false)
      setUser(null)
    }

    setIsLoading(false)
    setHasChecked(true)
    return !!token
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
    setHasChecked(true)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    user,
    isLoading,
    isAuthenticated,
    hasChecked,
    checkAuth,
    logout,
  }
}
