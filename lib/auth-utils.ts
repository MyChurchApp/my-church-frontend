// Funções de autenticação

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("authToken")
}

/**
 * Obtém o papel/função do usuário atual
 */
export function getUserRole(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("userRole")
}

/**
 * Obtém o ID do usuário atual
 */
export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null

  try {
    const token = localStorage.getItem("authToken")
    if (!token) return null

    // Tentar obter do objeto de usuário
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      if (user.id) return user.id.toString()
    }

    // Tentar decodificar do token JWT
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.nameid || payload.sub || null
  } catch (error) {
    console.error("Erro ao obter ID do usuário:", error)
    return null
  }
}

/**
 * Obtém o usuário atual
 */
export function getUser() {
  if (typeof window === "undefined") return null

  try {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("userRole")

    if (!token) return null

    // Tentar obter do objeto de usuário
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      return {
        id: user.id?.toString() || "1",
        name: user.name || "Usuário",
        email: user.email || user.identifier || "",
        role: role || "Membro",
        accessLevel: role === "Admin" ? "admin" : "member",
      }
    }

    // Tentar decodificar do token JWT
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      id: payload.nameid || payload.sub || "1",
      name: payload.name || payload.email || "Usuário",
      email: payload.email || "",
      role: role || "Membro",
      accessLevel: role === "Admin" ? "admin" : "member",
    }
  } catch (error) {
    console.error("Erro ao obter dados do usuário:", error)
    return null
  }
}
