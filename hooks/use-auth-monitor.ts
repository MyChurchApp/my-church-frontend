"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/auth-utils"

/**
 * Hook para monitorar o token de autenticação
 * Desloga automaticamente se o token não estiver presente
 */
export function useAuthMonitor() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthToken = () => {
      // Só verifica se estiver no browser
      if (typeof window === "undefined") return

      // Pega a rota atual
      const currentPath = window.location.pathname

      // Não verifica em páginas públicas
      const publicPaths = ["/", "/login", "/cadastro", "/contato", "/planos"]
      const isPublicPath = publicPaths.some((path) => currentPath === path || currentPath.startsWith("/planos/"))

      if (isPublicPath) return

      // Verifica se o token existe
      const token = getAuthToken()

      if (!token) {

        // Limpa qualquer dado restante
        localStorage.removeItem("userRole")
        localStorage.removeItem("user")

        // Redireciona para login
        router.push("/login")
      }
    }

    // Verifica imediatamente
    checkAuthToken()

    // Verifica a cada 5 segundos
    const interval = setInterval(checkAuthToken, 5000)

    // Verifica quando a aba ganha foco
    const handleFocus = () => checkAuthToken()
    window.addEventListener("focus", handleFocus)

    // Cleanup
    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
    }
  }, [router])
}
