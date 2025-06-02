"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function AuthRedirectPage() {
  const searchParams = useSearchParams()
  const { isAuthenticated, hasChecked } = useAuth()
  const redirectTo = searchParams.get("to") || "/dashboard"

  useEffect(() => {
    if (hasChecked) {
      if (isAuthenticated) {
        console.log("Redirecionando usuário autenticado para:", redirectTo)
        window.location.replace(redirectTo)
      } else {
        console.log("Usuário não autenticado, redirecionando para login")
        window.location.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`)
      }
    }
  }, [isAuthenticated, hasChecked, redirectTo])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
