import { authFetch, authFetchJson } from "@/lib/auth-fetch"

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
  church: {
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
  role: number
  created: string
  updated: string | null
  maritalStatus: string | null
  memberSince: string | null
  ministry: string | null
  isActive: boolean
  notes: string | null
}

// Interface para resposta paginada de membros
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

// Função para obter o token do localStorage
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

// Função para obter dados do usuário atual
const getCurrentUser = () => {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("authToken")
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      id: payload.nameid || "1",
      name: payload.name || payload.email || "Usuário",
      email: payload.email || "",
      churchId: payload.churchId || 0,
    }
  } catch (error) {
    console.error("Erro ao decodificar token:", error)
    return null
  }
}

// Função para tratar erros da API
const handleApiError = (status: number, errorText: string) => {
  if (status === 500) {
    // Disparar evento customizado para mostrar toast
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("api-error-500", {
          detail: { message: "Não foi possível completar a operação no momento. Tente novamente mais tarde." },
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

// Função para buscar o feed com paginação
export const getFeedFromAPI = async (page = 1, pageSize = 10): Promise<ApiFeedResponse> => {
  try {
    const url = `https://demoapp.top1soft.com.br/api/Feed?pageNumber=${page}&pageSize=${pageSize}`
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

// Função para buscar membros da API
export const getMembersFromAPI = async (page = 1, pageSize = 10): Promise<ApiMembersResponse> => {
  try {
    const url = `https://demoapp.top1soft.com.br/api/Member?pageNumber=${page}&pageSize=${pageSize}`
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
    const token = getAuthToken()
    if (!token) {
      throw new Error("Token de autenticação não encontrado. Faça login novamente.")
    }

    console.log("Dados enviados para API:", JSON.stringify(memberData, null, 2))

    const response = await fetch("https://demoapp.top1soft.com.br/api/Member", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "text/plain",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(memberData),
    })

    console.log("Status da resposta:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro da API:", response.status, errorText)
      handleApiError(response.status, errorText)
    }

    const data = await response.json()
    console.log("Resposta da API (sucesso):", data)

    // Verificar se a resposta contém os dados esperados
    if (!data || typeof data !== "object") {
      console.error("Resposta da API inválida:", data)
      throw new Error("Resposta da API inválida")
    }

    return data as ApiMember
  } catch (error) {
    console.error("Erro detalhado ao criar membro:", error)
    throw error
  }
}

// Função para atualizar um membro
export const updateMemberAPI = async (memberId: number, memberData: any): Promise<ApiMember> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Token de autenticação não encontrado. Faça login novamente.")
    }

    // Preparar dados no formato correto para o PUT
    // A API PUT espera um formato específico com campo "command"
    const updateData = {
      command: "UpdateMember", // ✅ Campo obrigatório adicionado
      id: memberId, // ✅ ID do membro
      name: memberData.name?.trim() || "",
      email: memberData.email?.trim() || "",
      phone: memberData.phone?.replace(/\D/g, "") || "", // Apenas números
      birthDate: memberData.birthDate ? new Date(memberData.birthDate).toISOString() : null, // ✅ Formato ISO correto
      isBaptized: Boolean(memberData.isBaptized),
      baptizedDate: memberData.baptizedDate ? new Date(memberData.baptizedDate).toISOString() : null, // ✅ Formato ISO correto
      isTither: Boolean(memberData.isTither),
      maritalStatus:
        memberData.maritalStatus === "Solteiro"
          ? 0
          : memberData.maritalStatus === "Casado"
            ? 1
            : memberData.maritalStatus === "Divorciado"
              ? 2
              : memberData.maritalStatus === "Viuvo"
                ? 3
                : 0, // Converter para número
      memberSince: memberData.memberSince ? new Date(memberData.memberSince).toISOString() : null, // ✅ Formato ISO correto
      ministry:
        memberData.ministry === "Louvor"
          ? 0
          : memberData.ministry === "Ensino"
            ? 1
            : memberData.ministry === "Evangelismo"
              ? 2
              : memberData.ministry === "Intercessão"
                ? 3
                : memberData.ministry === "Crianças"
                  ? 4
                  : memberData.ministry === "Jovens"
                    ? 5
                    : memberData.ministry === "Casais"
                      ? 6
                      : memberData.ministry === "Diaconia"
                        ? 7
                        : memberData.ministry === "Mídia"
                          ? 8
                          : memberData.ministry === "Recepção"
                            ? 9
                            : 0, // Converter para número
      isActive: Boolean(memberData.isActive),
      notes: memberData.notes || "",
      photo: memberData.photo && memberData.photo !== "base64" ? memberData.photo : "",
    }

    console.log("Dados preparados para PUT (corrigidos):", JSON.stringify(updateData, null, 2))

    const response = await fetch(`https://demoapp.top1soft.com.br/api/Member/${memberId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        accept: "text/plain",
        Authorization: `Bearer ${token}`, // ✅ GARANTINDO "Bearer " com espaço
      },
      body: JSON.stringify(updateData),
    })

    console.log("Status da resposta PUT:", response.status)
    console.log("Headers da resposta PUT:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Erro na API: ${response.status}`

      try {
        const errorText = await response.text()
        console.error("Erro da API (PUT):", response.status, errorText)

        // Tentar fazer parse do JSON de erro para obter detalhes
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.errors) {
            const errorDetails = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
              .join("; ")
            errorMessage = `Erro de validação: ${errorDetails}`
          } else if (errorData.title) {
            errorMessage = errorData.title
          }
        } catch (parseError) {
          // Se não conseguir fazer parse, usar o texto original
          errorMessage += `: ${errorText}`
        }

        if (response.status === 401) {
          errorMessage = "Sessão expirada. Faça login novamente."
          // Limpar dados de autenticação
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken")
            localStorage.removeItem("userRole")
            localStorage.removeItem("user")
            setTimeout(() => (window.location.href = "/login"), 1000)
          }
        } else if (response.status === 400) {
          // Manter a mensagem de erro detalhada para 400
        } else if (response.status === 404) {
          errorMessage = "Membro não encontrado."
        }
      } catch (e) {
        console.error("Erro ao processar resposta de erro:", e)
      }

      throw new Error(errorMessage)
    }

    const data: ApiMember = await response.json()
    console.log("Resposta da API (PUT sucesso):", data)
    return data
  } catch (error) {
    console.error("Erro detalhado ao atualizar membro:", error)
    throw error
  }
}

// Função para deletar um membro
export const deleteMemberAPI = async (memberId: number): Promise<boolean> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Token de autenticação não encontrado. Faça login novamente.")
    }

    const response = await fetch(`https://demoapp.top1soft.com.br/api/Member/${memberId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        accept: "text/plain",
        Authorization: `Bearer ${token}`,
      },
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

// Função para criar um post no feed
export const createFeedPost = async (content: string): Promise<ApiFeedItem> => {
  try {
    const response = await authFetchJson("https://demoapp.top1soft.com.br/api/Feed", {
      method: "POST",
      body: JSON.stringify({ content }),
    })

    console.log("Resposta da API ao criar post:", response)

    // A API retorna apenas o ID do post criado
    if (typeof response === "number") {
      const postId = response
      console.log("Post criado com ID:", postId)

      // Buscar o feed atualizado para encontrar o post completo
      try {
        const feedData = await getFeedFromAPI(1, 20)
        const createdPost = feedData.items.find((item) => item.id === postId)

        if (createdPost) {
          return createdPost
        } else {
          // Criar objeto temporário se não encontrar
          const currentUser = getCurrentUser()
          return {
            id: postId,
            content: content,
            memberId: Number.parseInt(currentUser?.id || "0"),
            churchId: 0,
            created: new Date().toISOString(),
            updated: null,
            member: {
              id: Number.parseInt(currentUser?.id || "0"),
              name: currentUser?.name || "Usuário",
              document: "",
              email: currentUser?.email || "",
              phone: "",
              photo: null,
              birthDate: "1990-01-01T00:00:00",
              isBaptized: false,
              baptizedDate: "1990-01-01T00:00:00",
              isTither: false,
              churchId: 0,
              church: null,
              role: 0,
              created: new Date().toISOString(),
              updated: null,
              maritalStatus: null,
              memberSince: null,
              ministry: null,
              isActive: true,
              notes: null,
            },
            likesCount: 0,
          }
        }
      } catch (feedError) {
        console.error("Erro ao buscar feed após criar post:", feedError)
        throw feedError
      }
    }

    // Se a resposta já é um objeto completo
    if (typeof response === "object" && response.id !== undefined) {
      return response as ApiFeedItem
    }

    throw new Error("Estrutura da resposta não reconhecida")
  } catch (error) {
    console.error("Erro detalhado ao criar post:", error)
    throw error
  }
}

// Função para editar um post no feed
export const updateFeedPost = async (postId: number, content: string): Promise<ApiFeedItem> => {
  try {
    const response = await authFetchJson(`https://demoapp.top1soft.com.br/api/Feed/${postId}`, {
      method: "PUT",
      body: JSON.stringify({
        postId: 0,
        content,
      }),
    })

    // A API pode retornar o post completo atualizado
    if (typeof response === "object" && response.id !== undefined) {
      return response as ApiFeedItem
    }

    // Se a API retornar apenas sucesso, buscar o post atualizado
    const feedData = await getFeedFromAPI(1, 20)
    const updatedPost = feedData.items.find((item) => item.id === postId)

    if (updatedPost) {
      return updatedPost
    } else {
      throw new Error("Post atualizado não encontrado no feed")
    }
  } catch (error) {
    console.error("Erro detalhado ao editar post:", error)
    throw error
  }
}

// Função para deletar um post no feed
export const deleteFeedPost = async (postId: number): Promise<boolean> => {
  try {
    const response = await authFetch(`https://demoapp.top1soft.com.br/api/Feed/${postId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorText = await response.text()
      handleApiError(response.status, errorText)
    }

    return true
  } catch (error) {
    console.error("Erro detalhado ao deletar post:", error)
    throw error
  }
}

// Função para recarregar o feed
export const refreshFeed = async (page = 1, pageSize = 10): Promise<ApiFeedResponse> => {
  try {
    const data = await getFeedFromAPI(page, pageSize)
    return data
  } catch (error) {
    console.error("Erro ao recarregar feed:", error)
    throw error
  }
}

// Função melhorada para criar post com fallback
export const createFeedPostWithFallback = async (content: string): Promise<ApiFeedItem> => {
  try {
    // Tentar criar o post
    const newPost = await createFeedPost(content)
    return newPost
  } catch (error) {
    console.error("Erro ao criar post, tentando recarregar feed:", error)

    // Se der erro, tentar recarregar o feed para ver se o post foi criado
    try {
      const feedData = await refreshFeed(1, 20)
      if (feedData.items.length > 0) {
        // Procurar por um post com o mesmo conteúdo criado recentemente
        const recentPost = feedData.items.find((item) => {
          const postTime = new Date(item.created).getTime()
          const now = new Date().getTime()
          const timeDiff = now - postTime
          // Procurar posts criados nos últimos 30 segundos com o mesmo conteúdo
          return timeDiff < 30000 && item.content === content
        })

        if (recentPost) {
          console.log("Post foi criado com sucesso, encontrado no feed")
          return recentPost
        }
      }
    } catch (refreshError) {
      console.error("Erro ao recarregar feed:", refreshError)
    }

    // Se ainda assim não conseguir, lançar o erro original
    throw error
  }
}

// Função helper para converter ApiMember para o formato usado no frontend
export const convertApiMemberToLocal = (apiMember: ApiMember) => {
  if (!apiMember) {
    console.error("apiMember é undefined ou null")
    throw new Error("Dados do membro inválidos")
  }

  return {
    id: apiMember?.id?.toString() || Math.random().toString(36).substr(2, 9),
    name: apiMember?.name || "",
    email: apiMember?.email || "",
    phone: apiMember?.phone || "",
    cpf: apiMember?.document || "",
    birthDate: apiMember?.birthDate ? apiMember.birthDate.split("T")[0] : "",
    address: apiMember?.church?.address?.street || "",
    city: apiMember?.church?.address?.city || "",
    state: apiMember?.church?.address?.state || "",
    zipCode: apiMember?.church?.address?.zipCode || "",
    maritalStatus: apiMember?.maritalStatus || "",
    baptized: Boolean(apiMember?.isBaptized),
    memberSince: apiMember?.memberSince ? apiMember.memberSince.split("T")[0] : "",
    ministry: apiMember?.ministry || "",
    photo: apiMember?.photo || "/placeholder.svg?height=100&width=100",
    isActive: Boolean(apiMember?.isActive),
    notes: apiMember?.notes || "",
  }
}

// Função helper para converter dados do formulário para o formato da API
export const convertLocalMemberToApi = (localMember: any) => {
  const apiData: any = {
    name: localMember.name?.trim() || "",
    email: localMember.email?.trim() || "",
    document: localMember.document?.trim() || "",
    photo: localMember.photo && localMember.photo !== "base64" ? localMember.photo : "",
    phone: localMember.phone?.trim() || "",
    birthDate: localMember.birthDate ? new Date(localMember.birthDate).toISOString() : null, // ✅ Formato ISO
    isBaptized: Boolean(localMember.isBaptized),
    baptizedDate: localMember.baptizedDate ? new Date(localMember.baptizedDate).toISOString() : null, // ✅ Formato ISO
    isTither: Boolean(localMember.isTither),
    roleMember: 0,
    maritalStatus: localMember.maritalStatus || "",
    memberSince: localMember.memberSince ? new Date(localMember.memberSince).toISOString() : null, // ✅ Formato ISO
    ministry: localMember.ministry || "",
    isActive: localMember.isActive !== undefined ? Boolean(localMember.isActive) : true,
    notes: localMember.notes || "",
  }

  return apiData
}

// Função helper para converter valores numéricos de volta para strings
export const convertApiMemberToLocalForEdit = (apiMember: ApiMember) => {
  if (!apiMember) {
    console.error("apiMember é undefined ou null")
    throw new Error("Dados do membro inválidos")
  }

  // Mapear maritalStatus de número para string
  const maritalStatusMap: { [key: number]: string } = {
    0: "Solteiro",
    1: "Casado",
    2: "Divorciado",
    3: "Viuvo",
  }

  // Mapear ministry de número para string
  const ministryMap: { [key: number]: string } = {
    0: "Louvor",
    1: "Ensino",
    2: "Evangelismo",
    3: "Intercessão",
    4: "Crianças",
    5: "Jovens",
    6: "Casais",
    7: "Diaconia",
    8: "Mídia",
    9: "Recepção",
  }

  return {
    id: apiMember?.id?.toString() || Math.random().toString(36).substr(2, 9),
    name: apiMember?.name || "",
    email: apiMember?.email || "",
    phone: apiMember?.phone || "",
    cpf: apiMember?.document || "",
    birthDate: apiMember?.birthDate ? apiMember.birthDate.split("T")[0] : "",
    address: apiMember?.church?.address?.street || "",
    city: apiMember?.church?.address?.city || "",
    state: apiMember?.church?.address?.state || "",
    zipCode: apiMember?.church?.address?.zipCode || "",
    maritalStatus: maritalStatusMap[Number.parseInt(apiMember?.maritalStatus as any)] || apiMember?.maritalStatus || "",
    baptized: Boolean(apiMember?.isBaptized),
    baptizedDate: apiMember?.baptizedDate ? apiMember.baptizedDate.split("T")[0] : "",
    memberSince: apiMember?.memberSince ? apiMember.memberSince.split("T")[0] : "",
    ministry: ministryMap[Number.parseInt(apiMember?.ministry as any)] || apiMember?.ministry || "",
    photo: apiMember?.photo || "/placeholder.svg?height=100&width=100",
    isActive: Boolean(apiMember?.isActive),
    notes: apiMember?.notes || "",
    isTither: Boolean(apiMember?.isTither),
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

// Função helper para verificar se o post pode ser editado/deletado
export const canEditOrDeletePost = (createdDate: string): boolean => {
  const postTime = new Date(createdDate).getTime()
  const now = new Date().getTime()
  const timeDiff = now - postTime
  const twoHoursInMs = 2 * 60 * 60 * 1000

  return timeDiff < twoHoursInMs
}
