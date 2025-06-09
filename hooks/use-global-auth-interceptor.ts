"use client"

import { useEffect } from "react"
import { setupGlobalAuthInterceptor, teardownGlobalAuthInterceptor } from "@/lib/global-auth-interceptor"

/**
 * Hook para ativar o interceptor global de autenticação
 * Deve ser usado no layout principal da aplicação
 */
export function useGlobalAuthInterceptor() {
  useEffect(() => {
    // Ativar interceptor quando o componente montar
    setupGlobalAuthInterceptor()

    // Cleanup quando desmontar (opcional)
    return () => {
      teardownGlobalAuthInterceptor()
    }
  }, [])
}
