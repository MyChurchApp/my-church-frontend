"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading, hasChecked } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Lista de rotas protegidas
    const protectedRoutes = ["/dashboard"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    // Só verificar após a checagem inicial estar completa
    if (hasChecked && isProtectedRoute && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, hasChecked, pathname, router])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Lista de rotas protegidas
  const protectedRoutes = ["/dashboard"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Se é rota protegida e não está autenticado, não renderizar
  if (isProtectedRoute && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}
