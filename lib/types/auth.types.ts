// Tipos relacionados à autenticação

export interface AuthToken {
  nameid: string
  email: string
  name?: string
  role: string
  nbf: number
  exp: number
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  role?: string
  accessLevel?: string
}
