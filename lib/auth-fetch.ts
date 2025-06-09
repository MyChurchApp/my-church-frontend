// Função utilitária para fazer requisições autenticadas padronizadas
// ✅ GARANTIA TOTAL de "Bearer " (com espaço) em TODAS as requisições

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean
}

/**
 * Obter token do localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

/**
 * Limpar dados de autenticação
 */
function clearAuthData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }
}

/**
 * ✅ Função padronizada para fazer requisições autenticadas
 * GARANTIA ABSOLUTA de "Bearer " (com espaço) antes do token
 */
export async function authFetch(url: string, options: AuthFetchOptions = {}): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/plain", // Conforme a API espera
    ...((fetchOptions.headers as Record<string, string>) || {}),
  }

  // Adicionar token de autenticação se não for skipAuth
  if (!skipAuth) {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Token de autenticação não encontrado. Faça login novamente.")
    }

    // ✅ CRÍTICO: SEMPRE usar "Bearer " (com espaço) antes do token
    // Verificar se o token já tem "Bearer " no início
    let authHeader: string
    if (token.startsWith("Bearer ")) {
      authHeader = token
    } else {
      authHeader = `Bearer ${token}`
    }

    headers.Authorization = authHeader

    // ✅ Verificações de segurança extras
    console.log(`🔑 Token original: "${token.substring(0, 20)}..."`)
    console.log(`🔑 Authorization header: "${headers.Authorization.substring(0, 30)}..."`)
    console.log(`🔑 Token length: ${token.length}`)
    console.log(`🔑 Header length: ${headers.Authorization.length}`)
    console.log(`🔑 Starts with "Bearer ": ${headers.Authorization.startsWith("Bearer ")}`)

    // ✅ Verificação adicional para garantir que está correto
    if (!headers.Authorization.startsWith("Bearer ")) {
      console.error("❌ ERRO CRÍTICO: Authorization header não começa com 'Bearer '")
      console.error(`❌ Header atual: "${headers.Authorization}"`)
      throw new Error("Erro na formatação do token de autorização")
    }

    // ✅ Verificação específica do espaço após "Bearer"
    if (headers.Authorization.length < 8 || headers.Authorization.charAt(6) !== " ") {
      console.error("❌ ERRO CRÍTICO: Falta espaço após 'Bearer'")
      console.error(`❌ Caractere na posição 6: "${headers.Authorization.charAt(6)}"`)
      console.error(`❌ Header completo: "${headers.Authorization}"`)
      throw new Error("Token deve ter espaço após 'Bearer'")
    }

    // ✅ Verificação final do formato
    const bearerPattern = /^Bearer [A-Za-z0-9\-._~+/]+=*$/
    if (!bearerPattern.test(headers.Authorization)) {
      console.warn("⚠️ AVISO: Token pode ter formato inválido")
      console.warn(`⚠️ Header: "${headers.Authorization.substring(0, 50)}..."`)
    }
  }

  console.log(`🔗 AuthFetch para: ${url}`)
  console.log(`🔑 Headers completos:`, {
    ...headers,
    Authorization: headers.Authorization ? `${headers.Authorization.substring(0, 20)}...` : "N/A",
  })
  console.log(`📦 Body:`, fetchOptions.body)

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  console.log(`📊 Status da resposta: ${response.status}`)
  console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()))

  // Tratar erros de autenticação
  if (response.status === 401 && !skipAuth) {
    console.error("❌ Erro 401 - Token inválido ou expirado")
    console.error("❌ Verifique se o token tem 'Bearer ' no início")
    console.error(`❌ Header enviado: "${headers.Authorization?.substring(0, 30)}..."`)

    // Tentar obter mais detalhes do erro
    try {
      const errorText = await response.text()
      console.error("❌ Resposta do servidor:", errorText)
    } catch (e) {
      console.error("❌ Não foi possível ler a resposta de erro")
    }

    clearAuthData()
    throw new Error("Sessão expirada. Faça login novamente.")
  }

  return response
}

/**
 * ✅ Fazer requisição JSON autenticada
 * Tratamento melhorado para diferentes tipos de resposta
 */
export async function authFetchJson(url: string, options: AuthFetchOptions = {}): Promise<any> {
  try {
    const response = await authFetch(url, options)

    console.log(`📊 Status final: ${response.status}`)

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

    // Verificar o tipo de conteúdo da resposta
    const contentType = response.headers.get("content-type")
    console.log(`📄 Content-Type: ${contentType}`)

    // Se a resposta for text/plain (como a API retorna para algumas operações)
    if (contentType && contentType.includes("text/plain")) {
      const text = await response.text()
      console.log("📄 Resposta text/plain:", text)

      // Tentar fazer parse como JSON se possível
      try {
        const parsed = JSON.parse(text)
        console.log("✅ Text/plain parseado como JSON:", parsed)
        return parsed
      } catch {
        // Se não conseguir fazer parse, retornar como texto
        console.log("✅ Retornando como texto puro")
        return text
      }
    }

    // Se for JSON, fazer parse
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      console.log("✅ Resposta JSON:", data)
      return data
    }

    // Fallback para texto
    const text = await response.text()
    console.log("✅ Fallback para texto:", text)
    return text
  } catch (error) {
    console.error("❌ Erro na requisição authFetchJson:", error)
    throw error
  }
}

/**
 * ✅ Função para testar o token atual
 */
export function testAuthToken(): void {
  const token = getAuthToken()
  if (!token) {
    console.log("❌ Nenhum token encontrado")
    return
  }

  console.log("🔍 Testando token atual:")
  console.log(`📏 Comprimento: ${token.length}`)
  console.log(`🔤 Primeiros 20 chars: "${token.substring(0, 20)}..."`)
  console.log(`🔤 Últimos 10 chars: "...${token.substring(token.length - 10)}`)
  console.log(`✅ Tem "Bearer ": ${token.startsWith("Bearer ")}`)

  if (token.startsWith("Bearer ")) {
    const actualToken = token.substring(7)
    console.log(`🎯 Token sem Bearer: "${actualToken.substring(0, 20)}..."`)
    console.log(`📏 Comprimento do token: ${actualToken.length}`)
  }

  // Tentar decodificar JWT se possível
  try {
    const tokenPart = token.startsWith("Bearer ") ? token.substring(7) : token
    const parts = tokenPart.split(".")
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      console.log("🔓 Payload do JWT:", payload)
      console.log(`⏰ Expira em: ${new Date(payload.exp * 1000).toLocaleString()}`)
    }
  } catch (e) {
    console.log("⚠️ Não foi possível decodificar como JWT")
  }
}

// Exportação padrão para compatibilidade
export default authFetch
