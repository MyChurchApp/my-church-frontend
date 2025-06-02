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
    // Só verificar após a checagem inicial estar completa
    if (hasChecked && pathname.startsWith("/dashboard") && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, hasChecked, pathname, router])

  // Rotas públicas que não precisam de verificação
  const publicRoutes = ["/", "/contato", "/planos", "/cadastro", "/termos", "/privacidade"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // Se é rota pública, renderizar diretamente
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Se está carregando ou ainda não verificou, mostrar loading apenas para rotas protegidas
  if ((isLoading || !hasChecked) && pathname.startsWith("/dashboard")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se é dashboard e não está autenticado, não renderizar (vai redirecionar)
  if (pathname.startsWith("/dashboard") && !isAuthenticated && hasChecked) {
    return null
  }

  return <>{children}</>
}
