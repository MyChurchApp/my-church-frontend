// Utilitários para autenticação - APENAS API REAL
import type { CurrentUser } from "../types/auth.types"

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  if (!token) return false

  try {
    // Verificar se o token não expirou
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp && payload.exp > currentTime
  } catch (error) {
    return false
  }
}

export const getCurrentUser = (): CurrentUser | null => {
  if (!isAuthenticated()) return null

  try {
    // Primeiro tentar obter do localStorage
    const userInfo = localStorage.getItem("user")
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo)
      return {
        id: parsedUser.id,
        name: parsedUser.name,
        email: parsedUser.email,
        role: parsedUser.role,
        accessLevel: parsedUser.role === "Admin" ? "admin" : "user",
      }
    }

    // Fallback: decodificar do token
    const token = getAuthToken()
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return {
        id: payload.nameid,
        name: payload.name || "Usuário",
        email: payload.email,
        role: payload.role,
        accessLevel: payload.role === "Admin" ? "admin" : "user",
      }
    }
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error)
  }

  return null
}

export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }
}

export const saveAuthToken = (token: string, role?: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token)
    if (role) {
      localStorage.setItem("userRole", role)
    }
  }
}

// Função para verificar se o token está próximo do vencimento
export const isTokenExpiringSoon = (): boolean => {
  const token = getAuthToken()
  if (!token) return false

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = payload.exp - currentTime

    // Retorna true se o token expira em menos de 5 minutos
    return timeUntilExpiry < 300
  } catch (error) {
    return false
  }
}

// Função para obter informações do token
export const getTokenInfo = () => {
  const token = getAuthToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      userId: payload.nameid,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
    }
  } catch (error) {
    return null
  }
}
