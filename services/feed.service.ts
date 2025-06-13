import { authFetch } from "@/lib/auth-fetch"

// Interfaces para o Feed
export interface FeedMember {
  id: number
  name: string
  document: Array<{
    id: number
    memberId: number
    type: number
    number: string
  }>
  email: string
  phone: string
  photo: string | null
  birthDate: string
  isBaptized: boolean
  baptizedDate: string
  isTither: boolean
  churchId: number
  church: string | null
  role: number
  created: string
  updated: string | null
  maritalStatus: string | null
  memberSince: string | null
  ministry: string | null
  isActive: boolean
  notes: string | null
}

export interface FeedItem {
  id: number
  content: string
  memberId: number
  churchId: number
  created: string
  updated: string | null
  member: FeedMember
  likesCount: number
}

export interface FeedResponse {
  items: FeedItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CreateFeedPostRequest {
  content: string
}

export interface UpdateFeedPostRequest {
  content: string
}

// Interface para erros da API
export interface ApiError {
  errors: {
    [key: string]: string[]
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api"

// Função helper para extrair mensagens de erro da API
const extractErrorMessage = async (response: Response): Promise<string> => {
  try {
    const errorData: ApiError = await response.json()

    if (errorData.errors) {
      // Extrair todas as mensagens de erro
      const allErrors: string[] = []
      Object.values(errorData.errors).forEach((errorArray) => {
        allErrors.push(...errorArray)
      })

      if (allErrors.length > 0) {
        return allErrors.join(". ")
      }
    }

    return `Erro ${response.status}: ${response.statusText}`
  } catch (error) {
    return `Erro ${response.status}: ${response.statusText}`
  }
}

// Função para buscar o feed
export const getFeed = async (pageNumber = 1, pageSize = 10): Promise<FeedResponse> => {
  try {
    const url = `${API_BASE_URL}/Feed?pageNumber=${pageNumber}&pageSize=${pageSize}`
    const response = await authFetch(url)

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Não autorizado. Faça login novamente.")
      }

      const errorMessage = await extractErrorMessage(response)
      throw new Error(errorMessage)
    }

    const data: FeedResponse = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar feed:", error)
    throw error
  }
}

// Função para criar um novo post
export const createFeedPost = async (content: string): Promise<number> => {
  try {
    const response = await authFetch(`${API_BASE_URL}/Feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Não autorizado. Faça login novamente.")
      }

      const errorMessage = await extractErrorMessage(response)
      throw new Error(errorMessage)
    }

    // A API retorna o ID do post criado
    const postId = await response.json()
    return postId as number
  } catch (error) {
    console.error("Erro ao criar post:", error)
    throw error
  }
}

// Função para atualizar um post
export const updateFeedPost = async (postId: number, content: string): Promise<void> => {
  try {
    const response = await authFetch(`${API_BASE_URL}/Feed/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Não autorizado. Faça login novamente.")
      }

      const errorMessage = await extractErrorMessage(response)
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error("Erro ao atualizar post:", error)
    throw error
  }
}

// Função para deletar um post
export const deleteFeedPost = async (postId: number): Promise<void> => {
  try {
    const response = await authFetch(`${API_BASE_URL}/Feed/${postId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Não autorizado. Faça login novamente.")
      }

      const errorMessage = await extractErrorMessage(response)
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error("Erro ao deletar post:", error)
    throw error
  }
}

// Função para buscar um post específico
export const getFeedPost = async (postId: number): Promise<FeedItem> => {
  try {
    const response = await authFetch(`${API_BASE_URL}/Feed/${postId}`)

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Não autorizado. Faça login novamente.")
      }

      const errorMessage = await extractErrorMessage(response)
      throw new Error(errorMessage)
    }

    const data: FeedItem = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar post:", error)
    throw error
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

// Função helper para verificar se o usuário pode editar/deletar o post
export const canEditOrDeletePost = (post: FeedItem, currentUserId: string): boolean => {
  // Verificar se é o autor do post
  if (post.memberId.toString() === currentUserId) {
    // Verificar se o post foi criado há menos de 2 horas
    return isRecentPost(post.created, 2)
  }

  // Verificar se é admin (pode editar qualquer post dentro do prazo)
  const userRole = localStorage.getItem("userRole")
  if (userRole === "Admin") {
    return isRecentPost(post.created, 2)
  }

  return false
}

// Função helper para verificar se o post foi criado recentemente (para permitir edição)
export const isRecentPost = (createdDate: string, hoursLimit = 2): boolean => {
  const postTime = new Date(createdDate).getTime()
  const now = new Date().getTime()
  const timeDiff = now - postTime
  const hoursInMs = hoursLimit * 60 * 60 * 1000

  return timeDiff < hoursInMs
}

// Função para obter o tempo restante para edição/exclusão
export const getTimeLeftForEdit = (createdDate: string, hoursLimit = 2): string => {
  const postTime = new Date(createdDate).getTime()
  const now = new Date().getTime()
  const timeDiff = now - postTime
  const hoursInMs = hoursLimit * 60 * 60 * 1000
  const timeLeft = hoursInMs - timeDiff

  if (timeLeft <= 0) {
    return "Tempo esgotado"
  }

  const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000))
  const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))

  if (hoursLeft > 0) {
    return `${hoursLeft}h ${minutesLeft}min restantes`
  } else {
    return `${minutesLeft}min restantes`
  }
}

// Função para obter estatísticas do feed
export const getFeedStats = async (): Promise<{
  totalPosts: number
  postsThisMonth: number
  activeMembers: number
}> => {
  try {
    const feedData = await getFeed(1, 100) // Buscar mais posts para estatísticas

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const postsThisMonth = feedData.items.filter((post) => new Date(post.created) >= thisMonth).length

    const uniqueMembers = new Set(feedData.items.map((post) => post.memberId))

    return {
      totalPosts: feedData.totalCount,
      postsThisMonth,
      activeMembers: uniqueMembers.size,
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas do feed:", error)
    return {
      totalPosts: 0,
      postsThisMonth: 0,
      activeMembers: 0,
    }
  }
}

// Função para buscar posts de um membro específico
export const getMemberPosts = async (memberId: number, pageNumber = 1, pageSize = 10): Promise<FeedResponse> => {
  try {
    // Como a API não tem filtro por membro, vamos buscar todos e filtrar
    const allFeed = await getFeed(1, 100)
    const memberPosts = allFeed.items.filter((post) => post.memberId === memberId)

    // Simular paginação
    const startIndex = (pageNumber - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedPosts = memberPosts.slice(startIndex, endIndex)

    return {
      items: paginatedPosts,
      pageNumber,
      pageSize,
      totalCount: memberPosts.length,
      totalPages: Math.ceil(memberPosts.length / pageSize),
    }
  } catch (error) {
    console.error("Erro ao buscar posts do membro:", error)
    throw error
  }
}

// Função para buscar posts recentes
export const getRecentPosts = async (limit = 5): Promise<FeedItem[]> => {
  try {
    const feedData = await getFeed(1, limit)
    return feedData.items
  } catch (error) {
    console.error("Erro ao buscar posts recentes:", error)
    return []
  }
}
