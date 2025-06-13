// Função para obter o token do localStorage
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

// Função para obter o usuário do localStorage
export const getUser = (): any | null => {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("user")
  if (userData) {
    try {
      return JSON.parse(userData)
    } catch (error) {
      console.error("Erro ao parsear dados do usuário:", error)
      return null
    }
  }

  // Tentar extrair informações básicas do token
  const token = getToken()
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return {
        id: payload.nameid || payload.sub || "1",
        name: payload.name || "Usuário",
        email: payload.email || "",
        role: payload.role || "Member",
        accessLevel: payload.role === "Admin" ? "admin" : "member",
      }
    } catch (error) {
      console.error("Erro ao decodificar token:", error)
    }
  }

  return null
}

// Função para verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  return !!getToken()
}

// Função para obter o papel/função do usuário
export const getUserRole = (): string => {
  const user = getUser()
  if (user && user.role) {
    return user.role
  }

  // Verificar no localStorage diretamente
  if (typeof window !== "undefined") {
    const role = localStorage.getItem("userRole")
    if (role) return role
  }

  return "Member" // Valor padrão
}

// Função para verificar permissões
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  if (userRole === "Admin") return true
  if (userRole === "Pastor" && requiredRole !== "Admin") return true
  if (userRole === "Leader" && (requiredRole === "Member" || requiredRole === "Leader")) return true
  if (userRole === "Member" && requiredRole === "Member") return true

  return false
}

// Função para fazer logout
export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }
}

// Função para obter dados básicos do usuário
export const getUserData = () => {
  if (typeof window === "undefined") return null

  const token = getToken()
  const role = getUserRole()
  const user = getUser()

  if (!token) return null

  return {
    id: user?.id || "1",
    name: user?.name || "Usuário",
    email: user?.email || "",
    role: role,
    accessLevel: role === "Admin" ? "admin" : "member",
  }
}

// Função para obter informações da igreja
export const getChurchInfo = () => {
  if (typeof window === "undefined") return null

  const churchData = localStorage.getItem("churchData")
  if (churchData) {
    try {
      return JSON.parse(churchData)
    } catch (error) {
      console.error("Erro ao parsear dados da igreja:", error)
    }
  }

  return {
    id: "1",
    name: "MyChurch",
    logo: "/mychurch-logo.png",
  }
}
