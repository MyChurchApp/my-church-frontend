/**
 * Funções utilitárias para autenticação
 */

/**
 * Obter token do localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

/**
 * Limpar dados de autenticação
 */
export function clearAuthData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }
}

/**
 * Verificar se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

/**
 * Obter papel do usuário
 */
export function getUserRole(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("userRole")
}

/**
 * Obter dados do usuário
 */
export function getUser(): any {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch (e) {
    console.error("Erro ao parsear dados do usuário:", e)
    return null
  }
}

/**
 * Obter token (alias para getAuthToken)
 */
export function getToken(): string | null {
  return getAuthToken()
}

/**
 * Fazer logout (alias para clearAuthData)
 */
export function logout(): void {
  clearAuthData()
}
