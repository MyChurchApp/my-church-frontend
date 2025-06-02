// Tipos para autenticação
export interface AuthToken {
  nameid: string
  email: string
  role: string
  name?: string
  exp: number
  iat: number
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
  accessLevel: "admin" | "user"
}

export interface LoginRequest {
  identifier: string
  password: string
}

export interface LoginResponse {
  token: {
    token: string
    role: string
  }
}
