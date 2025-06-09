"use client"

import { isAuthenticated, logout } from "@/lib/auth-utils"

let originalFetch: typeof fetch
let isInterceptorActive = false

/**
 * Interceptor global para monitorar todas as requisições
 * Faz logout automático quando detecta status 401
 */
export function setupGlobalAuthInterceptor() {
  if (isInterceptorActive) return

  // Salvar referência do fetch original
  originalFetch = window.fetch

  // Sobrescrever fetch global
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const response = await originalFetch(input, init)

      // Verificar se é uma requisição para nossa API
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
      const isApiRequest = url.includes("/api/") || url.includes(process.env.NEXT_PUBLIC_API_URL || "")

      // Se for 401 em requisição da API e usuário estiver logado
      if (response.status === 401 && isApiRequest && isAuthenticated()) {
        console.log("🚨 [Global Interceptor] 401 detectado:", url)

        // Disparar evento customizado para toast
        window.dispatchEvent(
          new CustomEvent("auth-error", {
            detail: { message: "Sessão expirada. Redirecionando para login..." },
          }),
        )

        // Fazer logout após um pequeno delay para mostrar o toast
        setTimeout(() => {
          logout()
        }, 1500)
      }

      return response
    } catch (error) {
      console.error("🚨 [Global Interceptor] Erro na requisição:", error)
      throw error
    }
  }

  isInterceptorActive = true
  console.log("✅ [Global Interceptor] Ativado")
}

/**
 * Remove o interceptor global (cleanup)
 */
export function teardownGlobalAuthInterceptor() {
  if (!isInterceptorActive || !originalFetch) return

  // Restaurar fetch original
  window.fetch = originalFetch
  isInterceptorActive = false
  console.log("🔄 [Global Interceptor] Desativado")
}
