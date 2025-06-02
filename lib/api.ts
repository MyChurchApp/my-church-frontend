// Funções para interagir com a API real

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

// Função para obter o token do localStorage
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

// Função para fazer requisições autenticadas
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()

  if (!token) {
    throw new Error("Token de autenticação não encontrado")
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token expirado ou inválido, redirecionar para login
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken")
        localStorage.removeItem("userRole")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
      throw new Error("Token expirado. Redirecionando para login...")
    }
    throw new Error(`Erro na API: ${response.status}`)
  }

  return response
}

// Função para buscar o feed com paginação
export const getFeedFromAPI = async (page = 1, pageSize = 10): Promise<ApiFeedResponse> => {
  try {
    const url = `https://demoapp.top1soft.com.br/api/Feed?pageNumber=${page}&pageSize=${pageSize}`
    const response = await authenticatedFetch(url)
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
    const response = await authenticatedFetch("https://demoapp.top1soft.com.br/api/Feed", {
      method: "POST",
      body: JSON.stringify({ content }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao criar post:", error)
    throw error
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
