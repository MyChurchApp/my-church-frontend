// Tipos que anteriormente estavam em fake-api.ts
export interface User {
  id: string
  name: string
  email: string
  role: string
  accessLevel: string
  phone?: string
  birthDate?: string
  photo?: string
  documents?: any[]
}

export interface ChurchData {
  id: string
  name: string
  logo?: string
  address?: string
  phone?: string
  email?: string
  website?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  timestamp: string
  read: boolean
}
