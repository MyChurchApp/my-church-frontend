// Utilitários para conversão de dados de membros

import type { ApiMember, CreateMemberRequest, Member, MemberFormData } from "../types/member.types"

export const convertApiMemberToLocal = (apiMember: ApiMember): Member => {
  return {
    id: apiMember.id.toString(),
    name: apiMember.name,
    email: apiMember.email,
    phone: apiMember.phone,
    cpf: apiMember.document,
    birthDate: apiMember.birthDate.split("T")[0], // Converter para formato YYYY-MM-DD
    address: "", // API não tem esses campos, usar valores padrão
    city: "",
    state: "",
    zipCode: "",
    maritalStatus: (apiMember.maritalStatus?.toLowerCase() || "solteiro") as
      | "solteiro"
      | "casado"
      | "divorciado"
      | "viuvo",
    baptized: apiMember.isBaptized,
    memberSince: apiMember.memberSince?.split("T")[0] || apiMember.created.split("T")[0],
    ministry: apiMember.ministry || "",
    photo: apiMember.photo || "/placeholder.svg?height=100&width=100",
    isActive: apiMember.isActive,
    notes: apiMember.notes || "",
  }
}

export const convertLocalMemberToAPI = (localMember: MemberFormData): CreateMemberRequest => {
  return {
    name: localMember.name,
    email: localMember.email,
    document: localMember.cpf.replace(/\D/g, ""), // Remover formatação do CPF
    photo: undefined, // Por enquanto não enviamos foto
    phone: localMember.phone.replace(/\D/g, ""), // Remover formatação do telefone
    birthDate: `${localMember.birthDate}T00:00:00`,
    isBaptized: localMember.baptized,
    baptizedDate: localMember.baptized ? `${localMember.birthDate}T00:00:00` : `${localMember.memberSince}T00:00:00`,
    isTither: true, // Valor padrão
    roleMember: 0, // Valor padrão para membro comum
    maritalStatus: localMember.maritalStatus.charAt(0).toUpperCase() + localMember.maritalStatus.slice(1),
    memberSince: `${localMember.memberSince}T00:00:00`,
    ministry: localMember.ministry,
    isActive: localMember.isActive,
    notes: localMember.notes || undefined,
  }
}

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "Agora mesmo"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} min atrás`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h atrás`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d atrás`
  } else {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }
}

export const canEditOrDeletePost = (createdDate: string): boolean => {
  const postTime = new Date(createdDate).getTime()
  const now = new Date().getTime()
  const timeDiff = now - postTime
  const twoHoursInMs = 2 * 60 * 60 * 1000 // 2 horas em milissegundos

  return timeDiff < twoHoursInMs
}
