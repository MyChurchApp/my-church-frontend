// Função utilitária para fazer requisições autenticadas padronizadas
// ✅ GARANTIA TOTAL de "Bearer " (com espaço) em TODAS as requisições
// ✅ LOGOUT AUTOMÁTICO em caso de 401 - VERSÃO CORRIGIDA

import { getToken } from "./auth-utils"

/**
 * Função para fazer requisições autenticadas
 * O interceptor global já cuida do logout em caso de 401
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()

  if (!token) {
    console.log("🚨 [authFetch] Token não encontrado")
    throw new Error("Token de autenticação não encontrado")
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  console.log(`🔄 [authFetch] ${options.method || "GET"} ${url}`)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log(`✅ [authFetch] ${response.status} ${url}`)

    // O interceptor global já cuida do 401, então só retornamos a response
    return response
  } catch (error) {
    console.error("🚨 [authFetch] Erro na requisição:", error)
    throw error
  }
}

/**
 * ✅ Fazer requisição JSON autenticada com LOGOUT AUTOMÁTICO
 */
export async function authFetchJson(url: string, options: AuthFetchOptions = {}): Promise<any> {
  try {
    console.log(`📋 AuthFetchJson iniciado para: ${url}`)
    const response = await authFetch(url, options)

    console.log(`📊 Status final no authFetchJson: ${response.status}`)

    // Se for 401, o authFetch já tratou o logout, mas vamos garantir
    if (response.status === 401) {
      console.error("🚨 401 confirmado no authFetchJson")
      throw new Error("Sessão expirada. Redirecionando para login...")
    }

    // Se não for bem-sucedido, tentar obter mais detalhes do erro
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

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean
  skipAutoLogout?: boolean // Para casos específicos onde não queremos logout automático
}
