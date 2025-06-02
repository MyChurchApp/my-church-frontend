// Utilitários HTTP

import { getAuthToken, redirectToLogin } from "./auth.utils"
import { API_CONFIG } from "../config/api.config"

export interface HttpOptions extends RequestInit {
  requireAuth?: boolean
}

export const createAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken()

  const headers: Record<string, string> = {
    "Content-Type": API_CONFIG.HEADERS.CONTENT_TYPE,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export const httpClient = async (url: string, options: HttpOptions = {}): Promise<Response> => {
  const { requireAuth = true, ...requestOptions } = options

  if (requireAuth && !getAuthToken()) {
    throw new Error("Token de autenticação não encontrado")
  }

  const headers = {
    ...createAuthHeaders(),
    ...requestOptions.headers,
  }

  const response = await fetch(url, {
    ...requestOptions,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin()
      throw new Error("Token expirado. Redirecionando para login...")
    }
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`)
  }

  return response
}
