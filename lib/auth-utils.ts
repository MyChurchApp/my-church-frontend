// Funções de autenticação

/**
 * Obtém o token de autenticação do localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    console.log("🚨 getToken: Executando no servidor, retornando null")
    return null
  }

  const token = localStorage.getItem("authToken")

  if (!token) {
    console.log("🚨 getToken: Token não encontrado no localStorage")
    return null
  }

  console.log("✅ getToken: Token encontrado, tamanho:", token.length)

  // Verificar se o token não expirou
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const now = Math.floor(Date.now() / 1000)

    if (payload.exp && payload.exp < now) {
      console.log("🚨 getToken: Token expirado")
      localStorage.removeItem("authToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("user")
      return null
    }

    console.log("✅ getToken: Token válido, expira em:", new Date(payload.exp * 1000))
  } catch (error) {
    console.error("🚨 getToken: Erro ao validar token:", error)
  }

  return token
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!getToken()
}

/**
 * Obtém o churchId do usuário atual do token
 */
export function getChurchId(): number | null {
  if (typeof window === "undefined") return null

  const token = getToken()
  if (!token) return null

  try {
    // Primeiro, tentar obter do token JWT
    const payload = JSON.parse(atob(token.split(".")[1]))
    if (payload.churchId) {
      console.log("✅ ChurchId obtido do token:", payload.churchId)
      return Number.parseInt(payload.churchId)
    }

    // Backup: tentar obter do localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      if (user.churchId) {
        console.log("✅ ChurchId obtido do localStorage:", user.churchId)
        return Number.parseInt(user.churchId)
      }
    }

    console.log("🚨 ChurchId não encontrado no token nem no localStorage")
    return null
  } catch (error) {
    console.error("🚨 Erro ao obter churchId:", error)
    return null
  }
}
