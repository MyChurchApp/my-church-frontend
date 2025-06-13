import { authFetch, authFetchJson } from "@/lib/auth-fetch"

// Interfaces para a API real
export interface ApiMember {
  id: number
  name: string
  email: string
  phone: string
  photo: string | null
  birthDate: string
  isBaptized: boolean
  baptizedDate: string
  isTither: boolean
  churchId: number
  role: number
  created: string
  updated: string | null
  maritalStatus: string | null
  memberSince: string | null
  ministry: string | null
  isActive: boolean
  notes: string | null
  document: Array<{
    id: number
    memberId: number
    type: number
    number: string
  }>
  church?: {
    id: number
    name: string
    logo: string
    address: {
      id: number
      street: string
      city: string
      state: string
      zipCode: string
      country: string
      neighborhood: string
    }
    phone: string
    description: string
    members: string[]
    subscription: any
  }
}

export interface ApiMembersResponse {
  items: ApiMember[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface ApiFeedItem {
  id: number
  content: string
  memberId: number
  churchId: number
  created: string
  updated: string | null
  member: ApiMember
  likesCount: number
}

export interface ApiFeedResponse {
  items: ApiFeedItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// Enum para tipos de documento
export enum DocumentType {
  CPF = 1,
  RG = 2,
  TituloEleitor = 3,
  CNH = 4,
  CertidaoNascimento = 5,
  Outros = 99,
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api"

// Função para obter o token do localStorage
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

// Função para tratar erros da API
const handleApiError = (status: number, errorText: string) => {
  if (status === 500) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("api-error-500", {
          detail: {
            message: "Não foi possível completar a operação no momento. Tente novamente mais tarde.",
          },
        }),
      )
    }
    throw new Error("Erro interno do servidor")
  } else if (status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    throw new Error("Sessão expirada. Redirecionando para login...")
  } else if (status === 400) {
    throw new Error("Dados inválidos. Verifique os campos obrigatórios.")
  } else if (status === 404) {
    throw new Error("Recurso não encontrado.")
  } else {
    throw new Error(`Erro na API: ${status} - ${errorText}`)
  }
}

// Função para buscar membros da API
export const getMembersFromAPI = async (page = 1, pageSize = 10): Promise<ApiMembersResponse> => {
  try {
    const url = `${API_BASE_URL}/Member?pageNumber=${page}&pageSize=${pageSize}`
    const response = await authFetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      handleApiError(response.status, errorText)
    }

    const data: ApiMembersResponse = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar membros da API:", error)
    throw error
  }
}

// Função para criar um novo membro
export const createMemberAPI = async (memberData: any): Promise<ApiMember> => {
  try {
    const response = await authFetchJson(`${API_BASE_URL}/Member`, {
      method: "POST",
      body: JSON.stringify(memberData),
    })

    return response as ApiMember
  } catch (error) {
    console.error("Erro ao criar membro:", error)
    throw error
  }
}

// Função para atualizar um membro
export const updateMemberAPI = async (memberId: number, memberData: any): Promise<ApiMember> => {
  try {
    const response = await authFetchJson(`${API_BASE_URL}/Member/${memberId}`, {
      method: "PUT",
      body: JSON.stringify(memberData),
    })

    return response as ApiMember
  } catch (error) {
    console.error("Erro ao atualizar membro:", error)
    throw error
  }
}

// Função para deletar um membro
export const deleteMemberAPI = async (memberId: number): Promise<boolean> => {
  try {
    const response = await authFetch(`${API_BASE_URL}/Member/${memberId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorText = await response.text()
      handleApiError(response.status, errorText)
    }

    return response.ok
  } catch (error) {
    console.error("Erro ao deletar membro:", error)
    throw error
  }
}

// Função para buscar o feed com paginação
export const getFeedFromAPI = async (page = 1, pageSize = 10): Promise<ApiFeedResponse> => {
  try {
    const url = `${API_BASE_URL}/Feed?pageNumber=${page}&pageSize=${pageSize}`
    const response = await authFetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      handleApiError(response.status, errorText)
    }

    const data: ApiFeedResponse = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar feed da API:", error)
    throw error
  }
}

// Função para criar um post no feed
export const createFeedPost = async (content: string): Promise<ApiFeedItem> => {
  try {
    const response = await authFetchJson(`${API_BASE_URL}/Feed`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })

    // Se a API retorna apenas o ID, buscar o post completo
    if (typeof response === "number") {
      const feedData = await getFeedFromAPI(1, 20)
      const createdPost = feedData.items.find((item) => item.id === response)
      if (createdPost) {
        return createdPost
      }
    }

    return response as ApiFeedItem
  } catch (error) {
    console.error("Erro ao criar post:", error)
    throw error
  }
}

// Função para editar um post no feed
export const updateFeedPost = async (postId: number, content: string): Promise<ApiFeedItem> => {
  try {
    const response = await authFetchJson(`${API_BASE_URL}/Feed/${postId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    })

    if (typeof response === "object" && response.id !== undefined) {
      return response as ApiFeedItem
    }

    // Se não retornar o objeto completo, buscar do feed
    const feedData = await getFeedFromAPI(1, 20)
    const updatedPost = feedData.items.find((item) => item.id === postId)

    if (updatedPost) {
      return updatedPost
    } else {
      throw new Error("Post atualizado não encontrado")
    }
  } catch (error) {
    console.error("Erro ao editar post:", error)
    throw error
  }
}

// Função para deletar um post no feed
export const deleteFeedPost = async (postId: number): Promise<boolean> => {
  try {
    const response = await authFetch(`${API_BASE_URL}/Feed/${postId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorText = await response.text()
      handleApiError(response.status, errorText)
    }

    return true
  } catch (error) {
    console.error("Erro ao deletar post:", error)
    throw error
  }
}

// Função helper para converter ApiMember para o formato usado no frontend
export const convertApiMemberToLocal = (apiMember: ApiMember) => {
  if (!apiMember) {
    throw new Error("Dados do membro inválidos")
  }

  const documents = apiMember?.document || []
  const cpfDocument = documents.find((doc: any) => doc.type === DocumentType.CPF)
  const rgDocument = documents.find((doc: any) => doc.type === DocumentType.RG)

  return {
    id: apiMember.id.toString(),
    name: apiMember.name || "",
    email: apiMember.email || "",
    phone: apiMember.phone || "",
    cpf: cpfDocument?.number || "",
    rg: rgDocument?.number || "",
    birthDate: apiMember.birthDate ? apiMember.birthDate.split("T")[0] : "",
    address: apiMember.church?.address?.street || "",
    city: apiMember.church?.address?.city || "",
    state: apiMember.church?.address?.state || "",
    zipCode: apiMember.church?.address?.zipCode || "",
    maritalStatus: apiMember.maritalStatus || "",
    baptized: Boolean(apiMember.isBaptized),
    memberSince: apiMember.memberSince ? apiMember.memberSince.split("T")[0] : "",
    ministry: apiMember.ministry || "",
    photo: apiMember.photo || "",
    isActive: Boolean(apiMember.isActive),
    notes: apiMember.notes || "",
  }
}

// Função helper para converter dados do formulário para o formato da API
export const convertLocalMemberToApi = (localMember: any) => {
  return {
    name: localMember.name?.trim() || "",
    email: localMember.email?.trim() || "",
    document: localMember.document?.trim() || "",
    photo: localMember.photo || "",
    phone: localMember.phone?.trim() || "",
    birthDate: localMember.birthDate ? `${localMember.birthDate}T00:00:00` : "1990-01-01T00:00:00",
    isBaptized: Boolean(localMember.isBaptized),
    baptizedDate: localMember.baptizedDate ? `${localMember.baptizedDate}T00:00:00` : "2023-10-14T00:00:00",
    isTither: Boolean(localMember.isTither),
    maritalStatus: localMember.maritalStatus || "",
    memberSince: localMember.memberSince ? `${localMember.memberSince}T00:00:00` : "2020-01-01T00:00:00",
    ministry: localMember.ministry || "",
    isActive: localMember.isActive !== undefined ? Boolean(localMember.isActive) : true,
    notes: localMember.notes || "",
  }
}

// Função para verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
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

// Função helper para formatar data
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

// Função para obter o ID do usuário atual do token
export const getCurrentUserId = (): string | null => {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("authToken")
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.nameid || payload.sub || payload.id || null
  } catch (error) {
    console.error("Erro ao decodificar token para obter ID:", error)
    return null
  }
}
