// Função utilitária para fazer requisições autenticadas padronizadas
// ✅ GARANTIA TOTAL de "Bearer " (com espaço) em TODAS as requisições

import { getToken } from "./auth-utils"

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean
  skipAutoLogout?: boolean
}

/**
 * Função para fazer requisições autenticadas
 * GARANTINDO formato correto: "Bearer TOKEN"
 */
export async function authFetch(url: string, options: AuthFetchOptions = {}): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "*/*",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  }

  // Adicionar token de autenticação se não for skipAuth
  if (!skipAuth) {
    const token = getToken()
    if (!token) {
      console.log("🚨 [authFetch] Token não encontrado")
      throw new Error("Token de autenticação não encontrado")
    }

    // ✅ GARANTIR formato correto: "Bearer TOKEN" (com espaço)
    let authHeader = token
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      authHeader = `Bearer ${token}`
    }

    headers.Authorization = authHeader
    console.log(`🔑 [authFetch] Authorization: ${authHeader.substring(0, 20)}...`)
  }

  console.log(`🔄 [authFetch] ${fetchOptions.method || "GET"} ${url}`)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    console.log(`📊 [authFetch] Status: ${response.status} para ${url}`)

    // O interceptor global já cuida do 401
    return response
  } catch (error) {
    console.error("🚨 [authFetch] Erro na requisição:", error)
    throw error
  }
}

/**
 * ✅ Fazer requisição JSON autenticada
 */
export async function authFetchJson(url: string, options: AuthFetchOptions = {}): Promise<any> {
  try {
    console.log(`📋 [authFetchJson] Iniciando: ${url}`)
    const response = await authFetch(url, options)

    console.log(`📊 [authFetchJson] Status: ${response.status}`)

    if (response.status === 401) {
      console.error("🚨 401 confirmado no authFetchJson")
      throw new Error("Sessão expirada. Redirecionando para login...")
    }

    if (!response.ok) {
      let errorText = ""
      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          errorText = JSON.stringify(errorData)
          console.error("❌ Erro JSON:", errorData)
        } else {
          errorText = await response.text()
          console.error("❌ Erro texto:", errorText)
        }
      } catch (e) {
        errorText = "Erro desconhecido"
        console.error("❌ Erro ao processar resposta de erro:", e)
      }

      throw new Error(`Erro na API: ${response.status} - ${errorText}`)
    }

    // Se for 204 (No Content), retorna null
    if (response.status === 204) {
      console.log("✅ Resposta 204 - No Content")
      return null
    }

    // Processar resposta baseada no content-type
    const contentType = response.headers.get("content-type")
    console.log(`📄 Content-Type: ${contentType}`)

    if (contentType && contentType.includes("text/plain")) {
      const text = await response.text()
      console.log("📄 Resposta text/plain recebida")

      try {
        const parsed = JSON.parse(text)
        console.log("✅ Text/plain parseado como JSON")
        return parsed
      } catch {
        console.log("✅ Retornando como texto puro")
        return text
      }
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      console.log("✅ Resposta JSON recebida")
      return data
    }

    // Fallback para texto
    const text = await response.text()
    console.log("✅ Fallback para texto")
    return text
  } catch (error) {
    console.error("❌ Erro na requisição authFetchJson:", error)
    throw error
  }
}

// Exportação padrão para compatibilidade
export default authFetch
