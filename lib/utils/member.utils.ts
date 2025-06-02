// Utilitários para membros
import type { Member, MemberApiResponse, CreateMemberRequest } from "../types/member.types"

export const convertApiToMember = (apiMember: MemberApiResponse): Member => {
  return {
    id: apiMember.id,
    name: apiMember.name,
    email: apiMember.email,
    document: apiMember.document,
    photo: apiMember.photo,
    phone: apiMember.phone,
    birthDate: apiMember.birthDate,
    isBaptized: apiMember.isBaptized,
    baptizedDate: apiMember.baptizedDate,
    isTither: apiMember.isTither,
    roleMember: apiMember.roleMember,
    maritalStatus: apiMember.maritalStatus,
    memberSince: apiMember.memberSince,
    ministry: apiMember.ministry,
    isActive: apiMember.isActive,
    notes: apiMember.notes,
  }
}

export const convertMemberToApi = (member: CreateMemberRequest): CreateMemberRequest => {
  return {
    name: member.name,
    email: member.email,
    document: member.document,
    photo: member.photo,
    phone: member.phone,
    birthDate: member.birthDate,
    isBaptized: member.isBaptized,
    baptizedDate: member.baptizedDate,
    isTither: member.isTither,
    roleMember: member.roleMember,
    maritalStatus: member.maritalStatus,
    memberSince: member.memberSince,
    ministry: member.ministry,
    isActive: member.isActive,
    notes: member.notes,
  }
}

export const formatCPF = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, "")
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export const formatPhone = (phone: string): string => {
  const numbers = phone.replace(/\D/g, "")
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}
