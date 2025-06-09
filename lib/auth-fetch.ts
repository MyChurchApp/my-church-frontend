// Função utilitária para fazer requisições autenticadas padronizadas
// ✅ GARANTIA TOTAL de "Bearer " (com espaço) em TODAS as requisições
// ✅ LOGOUT AUTOMÁTICO em caso de 401 - VERSÃO CORRIGIDA

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean
  skipAutoLogout?: boolean // Para casos específicos onde não queremos logout automático
}

/**
 * Obter token do localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

/**
 * Limpar dados de autenticação e redirecionar - VERSÃO MELHORADA
 */
function clearAuthData(): void {
  if (typeof window !== "undefined") {
    console.log("🚪 INICIANDO LOGOUT AUTOMÁTICO devido a erro 401")

    // Limpar dados do localStorage
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("user")
    console.log("🗑️ Dados de autenticação removidos do localStorage")

    // Mostrar toast de erro se disponível
    try {
      const event = new CustomEvent("auth-error", {
        detail: { message: "Sessão expirada. Você será redirecionado para o login." },
      })
      window.dispatchEvent(event)
      console.log("📢 Evento de erro de autenticação disparado")
    } catch (e) {
      console.log("⚠️ Toast não disponível:", e)
    }

    // Aguardar um pouco para o toast aparecer, depois redirecionar
    setTimeout(() => {
      console.log("🔄 Redirecionando para /login...")
      window.location.href = "/login"
    }, 1000)
  }
}

/**
 * ✅ Função padronizada para fazer requisições autenticadas
 * LOGOUT AUTOMÁTICO GARANTIDO em caso de 401
 */
export async function authFetch(url: string, options: AuthFetchOptions = {}): Promise<Response> {
  const { skipAuth = false, skipAutoLogout = false, ...fetchOptions } = options

  console.log(`🔗 AuthFetch iniciado para: ${url}`)
  console.log(`🔧 Opções: skipAuth=${skipAuth}, skipAutoLogout=${skipAutoLogout}`)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/plain",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  }

  // Adicionar token de autenticação se não for skipAuth
  if (!skipAuth) {
    const token = getAuthToken()
    if (!token) {
      console.error("❌ Token de autenticação não encontrado")
      if (!skipAutoLogout) {
        console.log("🚪 Fazendo logout por falta de token")
        clearAuthData()
      }
      throw new Error("Token de autenticação não encontrado. Faça login novamente.")
    }

    headers.Authorization = `Bearer ${token}`
    console.log(`🔑 Token adicionado: ${token.substring(0, 20)}...`)
  }

  try {
    console.log(`📤 Fazendo requisição para: ${url}`)
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    console.log(`📊 Status da resposta: ${response.status}`)

    // ✅ TRATAMENTO CRÍTICO DE 401 - LOGOUT FORÇADO
    if (response.status === 401) {
      console.error("🚨 ERRO 401 DETECTADO!")
      console.error("🚨 Token inválido ou expirado")
      console.error(`🚨 URL que retornou 401: ${url}`)
      console.error(`🚨 skipAuth: ${skipAuth}, skipAutoLogout: ${skipAutoLogout}`)

      if (!skipAuth && !skipAutoLogout) {
        console.log("🚪 Executando logout automático...")
        clearAuthData()
      } else {
        console.log("⚠️ Logout automático pulado devido às opções")
      }
    }

    return response
  } catch (error) {
    console.error("❌ Erro na requisição authFetch:", error)
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
