"use client"

import { useEffect } from "react"
import { setupGlobalAuthInterceptor, teardownGlobalAuthInterceptor } from "@/lib/global-auth-interceptor"

export function GlobalAuthInterceptor() {
  useEffect(() => {
    // Ativar interceptor quando o componente montar
    setupGlobalAuthInterceptor()

    // Cleanup quando desmontar
    return () => {
      teardownGlobalAuthInterceptor()
    }
  }, [])

  // Este componente não renderiza nada visível
  return null
}
