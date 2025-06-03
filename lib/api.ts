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

  console.log("Headers da requisição:", headers)

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // Capturar o texto de erro da resposta
    let errorText = ""
    try {
      errorText = await response.text()
      console.error("Resposta de erro da API:", errorText)
    } catch (e) {
      console.error("Não foi possível ler a resposta de erro")
    }

    if (response.status === 401) {
      console.error("Erro de autenticação 401: Token inválido ou expirado")
      // Token expirado ou inválido, redirecionar para login
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken")
        localStorage.removeItem("userRole")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
      throw new Error("Token expirado. Redirecionando para login...")
    }

    throw new Error(`Erro na API: ${response.status} - ${errorText || response.statusText}`)
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

// Função para buscar membros da API
export const getMembersFromAPI = async (page = 1, pageSize = 10): Promise<ApiMembersResponse> => {
  try {
    const url = `https://demoapp.top1soft.com.br/api/Member?pageNumber=${page}&pageSize=${pageSize}`
    const response = await authenticatedFetch(url)
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
    // Verificar se o token existe
    const token = getAuthToken()
    if (!token) {
      console.error("Token de autenticação não encontrado")
      throw new Error("Token de autenticação não encontrado. Faça login novamente.")
    }

    console.log("Token de autenticação:", token.substring(0, 20) + "...")
    console.log("Dados enviados para API:", JSON.stringify(memberData, null, 2))

    const response = await fetch("https://demoapp.top1soft.com.br/api/Member", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(memberData),
    })

    console.log("Status da resposta:", response.status)
    console.log("Headers da resposta:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro da API (texto completo):", errorText)

      // Tentar fazer parse do JSON de erro se possível
      let errorDetails = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorDetails = JSON.stringify(errorJson, null, 2)
        console.error("Erro da API (JSON):", errorJson)
      } catch (e) {
        console.error("Erro não é JSON válido")
      }

      if (response.status === 401) {
        console.error("Erro de autenticação 401: Token inválido ou expirado")
        // Redirecionar para login
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken")
          localStorage.removeItem("userRole")
          localStorage.removeItem("user")
          alert("Sua sessão expirou. Por favor, faça login novamente.")
          window.location.href = "/login"
        }
        throw new Error("Token expirado. Redirecionando para login...")
      }

      throw new Error(`Erro na API: ${response.status} - ${errorDetails}`)
    }

    const data: ApiMember = await response.json()
    console.log("Resposta da API (sucesso):", data)
    return data
  } catch (error) {
    console.error("Erro detalhado ao criar membro:", error)
    throw error
  }
}

// Função para atualizar um membro
export const updateMemberAPI = async (memberId: number, memberData: any): Promise<ApiMember> => {
  try {
    // Verificar se o token existe
    const token = getAuthToken()
    if (!token) {
      console.error("Token de autenticação não encontrado")
      throw new Error("Token de autenticação não encontrado. Faça login novamente.")
    }

    console.log("Dados enviados para API (update):", JSON.stringify({ id: memberId, ...memberData }, null, 2))

    const response = await fetch(`https://demoapp.top1soft.com.br/api/Member/${memberId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: memberId, ...memberData }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro da API:", response.status, errorText)

      if (response.status === 401) {
        // Redirecionar para login
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken")
          localStorage.removeItem("userRole")
          localStorage.removeItem("user")
          alert("Sua sessão expirou. Por favor, faça login novamente.")
          window.location.href = "/login"
        }
        throw new Error("Token expirado. Redirecionando para login...")
      }

      throw new Error(`Erro na API: ${response.status} - ${errorText}`)
    }

    const data: ApiMember = await response.json()
    console.log("Resposta da API (update):", data)
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
      console.error("Token de autenticação não encontrado")
      throw new Error("Token de autenticação não encontrado. Faça login novamente.")
    }

    const response = await fetch(`https://demoapp.top1soft.com.br/api/Member/${memberId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status === 401) {
      // Redirecionar para login
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken")
        localStorage.removeItem("userRole")
        localStorage.removeItem("user")
        alert("Sua sessão expirou. Por favor, faça login novamente.")
        window.location.href = "/login"
      }
      throw new Error("Token expirado. Redirecionando para login...")
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
    const response = await authenticatedFetch("https://demoapp.top1soft.com.br/api/Feed", {
      method: "POST",
      body: JSON.stringify({ content }),
    })

    // Verificar se a resposta é válida
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    // Tentar fazer parse da resposta
    let data
    try {
      data = await response.json()
    } catch (parseError) {
      console.error("Erro ao fazer parse da resposta:", parseError)
      throw new Error("Resposta da API não é um JSON válido")
    }

    console.log("Resposta da API ao criar post:", data)

    // A API retorna apenas o ID do post criado
    if (typeof data === "number") {
      const postId = data
      console.log("Post criado com ID:", postId)

      // Buscar o feed atualizado para encontrar o post completo
      try {
        const feedData = await getFeedFromAPI(1, 20)
        const createdPost = feedData.items.find((item) => item.id === postId)

        if (createdPost) {
          console.log("Post completo encontrado:", createdPost)
          return createdPost
        } else {
          console.log("Post não encontrado no feed, criando objeto temporário")
          // Se não encontrar, criar um objeto temporário
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
        // Criar objeto temporário se não conseguir buscar o feed
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
    }

    // Se a resposta já é um objeto completo
    if (typeof data === "object" && data.id !== undefined) {
      console.log("Post completo retornado pela API:", data)
      return data as ApiFeedItem
    }

    // Se chegou até aqui, a estrutura não é reconhecida
    console.error("Estrutura da resposta não reconhecida:", data)
    throw new Error(`Estrutura da resposta não reconhecida. Tipo: ${typeof data}, Conteúdo: ${JSON.stringify(data)}`)
  } catch (error) {
    console.error("Erro detalhado ao criar post:", error)
    throw error
  }
}

// Função para editar um post no feed
export const updateFeedPost = async (postId: number, content: string): Promise<ApiFeedItem> => {
  try {
    const response = await authenticatedFetch(`https://demoapp.top1soft.com.br/api/Feed/${postId}`, {
      method: "PUT",
      body: JSON.stringify({
        postId: 0, // Conforme a documentação da API
        content,
      }),
    })

    // Verificar se a resposta é válida
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    // Tentar fazer parse da resposta
    let data
    try {
      data = await response.json()
    } catch (parseError) {
      console.error("Erro ao fazer parse da resposta:", parseError)
      throw new Error("Resposta da API não é um JSON válido")
    }

    console.log("Resposta da API ao editar post:", data)

    // A API pode retornar o post completo atualizado
    if (typeof data === "object" && data.id !== undefined) {
      console.log("Post editado com sucesso:", data)
      return data as ApiFeedItem
    }

    // Se a API retornar apenas sucesso, buscar o post atualizado
    try {
      const feedData = await getFeedFromAPI(1, 20)
      const updatedPost = feedData.items.find((item) => item.id === postId)

      if (updatedPost) {
        console.log("Post atualizado encontrado no feed:", updatedPost)
        return updatedPost
      } else {
        throw new Error("Post atualizado não encontrado no feed")
      }
    } catch (feedError) {
      console.error("Erro ao buscar feed após editar post:", feedError)
      throw new Error("Não foi possível verificar se o post foi atualizado")
    }
  } catch (error) {
    console.error("Erro detalhado ao editar post:", error)
    throw error
  }
}

// Função para deletar um post no feed
export const deleteFeedPost = async (postId: number): Promise<boolean> => {
  try {
    const response = await authenticatedFetch(`https://demoapp.top1soft.com.br/api/Feed/${postId}`, {
      method: "DELETE",
    })

    // Verificar se a resposta é válida
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    console.log("Post deletado com sucesso:", postId)
    return true
  } catch (error) {
    console.error("Erro detalhado ao deletar post:", error)
    throw error
  }
}

// Função para recarregar o feed (útil após criar um post)
export const refreshFeed = async (page = 1, pageSize = 10): Promise<ApiFeedResponse> => {
  try {
    console.log("Recarregando feed da API...")
    const data = await getFeedFromAPI(page, pageSize)
    console.log("Feed recarregado com sucesso:", data)
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
  return {
    id: apiMember.id.toString(),
    name: apiMember.name,
    email: apiMember.email,
    phone: apiMember.phone,
    cpf: apiMember.document,
    birthDate: apiMember.birthDate.split("T")[0], // Converter para formato YYYY-MM-DD
    address: apiMember.church?.address?.street || "",
    city: apiMember.church?.address?.city || "",
    state: apiMember.church?.address?.state || "",
    zipCode: apiMember.church?.address?.zipCode || "",
    maritalStatus: apiMember.maritalStatus || "",
    baptized: apiMember.isBaptized,
    memberSince: apiMember.memberSince ? apiMember.memberSince.split("T")[0] : "",
    ministry: apiMember.ministry || "",
    photo: apiMember.photo || "/placeholder.svg?height=100&width=100",
    isActive: apiMember.isActive,
    notes: apiMember.notes || "",
  }
}

// Função helper para converter dados do formulário para o formato da API
export const convertLocalMemberToApi = (localMember: any) => {
  // Obter o churchId do token
  const currentUser = getCurrentUser()
  const churchId = currentUser?.churchId || 0

  // Estrutura baseada EXATAMENTE no exemplo da documentação
  const apiData: any = {
    name: localMember.name.trim(),
    email: localMember.email.trim(),
    phone: localMember.phone.trim(),
    document: localMember.document.trim(), // Always required
    photo: "base64", // Default value as per API example
    isBaptized: Boolean(localMember.isBaptized),
    isTither: Boolean(localMember.isTither),
    roleMember: 0, // Default role
    isActive: localMember.isActive !== undefined ? Boolean(localMember.isActive) : true,
    churchId: churchId,
  }

  // Add birthDate - this appears to be required based on the API example
  if (localMember.birthDate && localMember.birthDate.trim()) {
    apiData.birthDate = localMember.birthDate + "T00:00:00"
  } else {
    // If no birth date provided, use a default date
    apiData.birthDate = "1990-01-01T00:00:00"
  }

  // Add baptizedDate only if baptized is true
  if (apiData.isBaptized) {
    if (localMember.baptizedDate && localMember.baptizedDate.trim()) {
      apiData.baptizedDate = localMember.baptizedDate + "T00:00:00"
    } else {
      // If baptized but no date provided, use current date
      const today = new Date().toISOString().split("T")[0]
      apiData.baptizedDate = today + "T00:00:00"
    }
  }

  // Add optional fields only if they have values
  if (localMember.maritalStatus && localMember.maritalStatus.trim()) {
    apiData.maritalStatus = localMember.maritalStatus.trim()
  }

  if (localMember.memberSince && localMember.memberSince.trim()) {
    apiData.memberSince = localMember.memberSince + "T00:00:00"
  }

  if (localMember.ministry && localMember.ministry.trim()) {
    apiData.ministry = localMember.ministry.trim()
  }

  if (localMember.notes && localMember.notes.trim()) {
    apiData.notes = localMember.notes.trim()
  }

  console.log("Dados convertidos para API (final):", apiData)
  return apiData
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

// Função helper para verificar se o post pode ser editado/deletado (menos de 2 horas)
export const canEditOrDeletePost = (createdDate: string): boolean => {
  const postTime = new Date(createdDate).getTime()
  const now = new Date().getTime()
  const timeDiff = now - postTime
  const twoHoursInMs = 2 * 60 * 60 * 1000 // 2 horas em milissegundos

  return timeDiff < twoHoursInMs
}
