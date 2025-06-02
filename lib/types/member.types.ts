// Tipos para membros
export interface Member {
  id: string
  name: string
  email: string
  document: string
  photo?: string
  phone: string
  birthDate: string
  isBaptized: boolean
  baptizedDate?: string
  isTither: boolean
  roleMember: number
  maritalStatus: string
  memberSince: string
  ministry: string
  isActive: boolean
  notes?: string
}

export interface CreateMemberRequest {
  name: string
  email: string
  document: string
  photo?: string
  phone: string
  birthDate: string
  isBaptized: boolean
  baptizedDate?: string
  isTither: boolean
  roleMember: number
  maritalStatus: string
  memberSince: string
  ministry: string
  isActive: boolean
  notes?: string
}

export interface UpdateMemberRequest extends Partial<CreateMemberRequest> {
  id: string
}

export interface MemberApiResponse {
  id: string
  name: string
  email: string
  document: string
  photo?: string
  phone: string
  birthDate: string
  isBaptized: boolean
  baptizedDate?: string
  isTither: boolean
  roleMember: number
  maritalStatus: string
  memberSince: string
  ministry: string
  isActive: boolean
  notes?: string
}
