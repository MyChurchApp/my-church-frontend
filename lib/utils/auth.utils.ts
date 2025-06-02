// Utilitários de autenticação

import type { AuthToken, CurrentUser } from "../types/auth.types"

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

export const getCurrentUser = (): CurrentUser | null => {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("authToken")
  if (!token) return null

  try {
    const payload: AuthToken = JSON.parse(atob(token.split(".")[1]))
    return {
      id: payload.nameid || "1",
      name: payload.name || payload.email || "Usuário",
      email: payload.email || "",
      role: payload.role,
      accessLevel: payload.role?.toLowerCase() === "admin" ? "admin" : "user",
    }
  } catch (error) {
    console.error("Erro ao decodificar token:", error)
    return null
  }
}

export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }
}

export const redirectToLogin = (): void => {
  if (typeof window !== "undefined") {
    logout()
  }
}
