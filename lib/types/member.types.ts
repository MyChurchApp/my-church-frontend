// Tipos relacionados aos membros

export interface ApiMember {
  id: number
  name: string
  document: string
  email: string
  phone: string
  photo: string | null
  birthDate: string
  isBaptized: boolean
  baptizedDate: string
  isTither: boolean
  churchId: number
  church: any
  role: number
  created: string
  updated: string | null
  maritalStatus: string | null
  memberSince: string | null
  ministry: string | null
  isActive: boolean
  notes: string | null
}

export interface CreateMemberRequest {
  name: string
  email: string
  document: string
  photo?: string
  phone: string
  birthDate: string
  isBaptized: boolean
  baptizedDate: string
  isTither: boolean
  roleMember: number
  maritalStatus: string
  memberSince: string
  ministry: string
  isActive: boolean
  notes?: string
}

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  address: string
  city: string
  state: string
  zipCode: string
  maritalStatus: "solteiro" | "casado" | "divorciado" | "viuvo"
  baptized: boolean
  memberSince: string
  ministry: string
  photo: string
  isActive: boolean
  notes: string
}

export interface MemberFormData {
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  address: string
  city: string
  state: string
  zipCode: string
  maritalStatus: string
  baptized: boolean
  memberSince: string
  ministry: string
  isActive: boolean
  notes: string
}
