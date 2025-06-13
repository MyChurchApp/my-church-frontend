import { authFetchJson } from "@/lib/auth-fetch"

// Interface para Address
export interface ChurchAddress {
  id: number
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  neighborhood: string
}

// Interface para Member (versão simplificada para Church)
export interface ChurchMember {
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
  church: string
  role: number
  created: string
  updated: string | null
  maritalStatus: string | null
  memberSince: string | null
  ministry: string | null
  isActive: boolean
  notes: string | null
}

// Interface para Plan
export interface ChurchPlan {
  id: number
  name: string
  price: number
  maxMembers: number
  maxEvents: number
  maxStorageGB: number
}

// Interface para Payment
export interface ChurchPayment {
  id: number
  subscriptionId: number
  subscription: string
  amount: number
  date: string
  paymentStatus: string
  transactionId: string
}

// Interface para Subscription
export interface ChurchSubscription {
  id: number
  churchId: number
  church: string
  planId: number
  plan: ChurchPlan
  startDate: string
  endDate: string
  isActive: boolean
  payments: ChurchPayment[]
}

// Interface principal para Church
export interface Church {
  id: number
  name: string
  logo: string
  address: ChurchAddress
  phone: string
  description: string
  members: ChurchMember[]
  subscription: ChurchSubscription
}

// Função para obter o churchId do token
const getChurchIdFromToken = (): number | null => {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("authToken")
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const churchId = payload.churchId || payload.ChurchId || payload.church_id

    if (churchId) {
      console.log("✅ ChurchId encontrado no token:", churchId)
      return Number.parseInt(churchId)
    }

    console.log("🚨 ChurchId não encontrado no token. Payload:", payload)
    return null
  } catch (error) {
    console.error("Erro ao decodificar token para obter churchId:", error)
    return null
  }
}

// Função para obter o churchId do localStorage (backup)
const getChurchIdFromStorage = (): number | null => {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("user")
  if (!userData) return null

  try {
    const user = JSON.parse(userData)
    const churchId = user.churchId || user.ChurchId || user.church_id

    if (churchId) {
      console.log("✅ ChurchId encontrado no localStorage:", churchId)
      return Number.parseInt(churchId)
    }

    console.log("🚨 ChurchId não encontrado no localStorage. User:", user)
    return null
  } catch (error) {
    console.error("Erro ao obter churchId do localStorage:", error)
    return null
  }
}

// Função para tratar erros da API
const handleApiError = (status: number, errorText: string) => {
  if (status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    throw new Error("Sessão expirada. Redirecionando para login...")
  } else if (status === 400) {
    throw new Error("Dados inválidos. Verifique os parâmetros da requisição.")
  } else if (status === 404) {
    throw new Error("Igreja não encontrada.")
  } else if (status === 500) {
    throw new Error("Erro interno do servidor. Tente novamente mais tarde.")
  } else {
    throw new Error(`Erro na API: ${status} - ${errorText}`)
  }
}

// Função principal para buscar dados da igreja
export const getChurchData = async (churchId?: number): Promise<Church> => {
  try {
    // Usar churchId fornecido ou tentar obter do token/localStorage
    let targetChurchId = churchId

    if (!targetChurchId) {
      targetChurchId = getChurchIdFromToken() || getChurchIdFromStorage()
    }

    if (!targetChurchId) {
      throw new Error("ID da igreja não encontrado. Faça login novamente.")
    }

    console.log("🏛️ Buscando dados da igreja com ID:", targetChurchId)

    const url = `https://demoapp.top1soft.com.br/api/Church/${targetChurchId}`
    const data = await authFetchJson(url)

    console.log("✅ Dados da igreja recebidos:", data.name, "- Membros:", data.members?.length || 0)
    return data as Church
  } catch (error) {
    console.error("❌ Erro ao buscar dados da igreja:", error)
    throw error
  }
}

// Função para obter informações básicas da igreja (sem membros)
export const getChurchBasicInfo = async (churchId?: number): Promise<Partial<Church>> => {
  try {
    const churchData = await getChurchData(churchId)

    // Retornar apenas informações básicas (sem a lista completa de membros)
    return {
      id: churchData.id,
      name: churchData.name,
      logo: churchData.logo,
      address: churchData.address,
      phone: churchData.phone,
      description: churchData.description,
      subscription: churchData.subscription,
    }
  } catch (error) {
    console.error("Erro ao buscar informações básicas da igreja:", error)
    throw error
  }
}

// Função para obter apenas os membros da igreja
export const getChurchMembers = async (churchId?: number): Promise<ChurchMember[]> => {
  try {
    const churchData = await getChurchData(churchId)
    return churchData.members || []
  } catch (error) {
    console.error("Erro ao buscar membros da igreja:", error)
    throw error
  }
}

// Função para verificar se a igreja tem uma assinatura ativa
export const isChurchSubscriptionActive = async (churchId?: number): Promise<boolean> => {
  try {
    const churchData = await getChurchData(churchId)
    return churchData.subscription?.isActive || false
  } catch (error) {
    console.error("Erro ao verificar assinatura da igreja:", error)
    return false
  }
}

// Função para obter detalhes do plano da igreja
export const getChurchPlan = async (churchId?: number): Promise<ChurchPlan | null> => {
  try {
    const churchData = await getChurchData(churchId)
    return churchData.subscription?.plan || null
  } catch (error) {
    console.error("Erro ao obter plano da igreja:", error)
    return null
  }
}

// Função helper para formatar endereço
export const formatChurchAddress = (address: ChurchAddress): string => {
  if (!address) return ""

  const parts = [address.street, address.neighborhood, address.city, address.state, address.zipCode].filter(Boolean)

  return parts.join(", ")
}

// Função helper para verificar limites do plano
export const checkPlanLimits = async (churchId?: number) => {
  try {
    const churchData = await getChurchData(churchId)
    const plan = churchData.subscription?.plan
    const currentMembers = churchData.members?.length || 0

    if (!plan) {
      return {
        hasActivePlan: false,
        membersLimit: 0,
        currentMembers: 0,
        canAddMembers: false,
        eventsLimit: 0,
        storageLimit: 0,
      }
    }

    return {
      hasActivePlan: churchData.subscription?.isActive || false,
      membersLimit: plan.maxMembers,
      currentMembers: currentMembers,
      canAddMembers: currentMembers < plan.maxMembers,
      eventsLimit: plan.maxEvents,
      storageLimit: plan.maxStorageGB,
      planName: plan.name,
      planPrice: plan.price,
    }
  } catch (error) {
    console.error("Erro ao verificar limites do plano:", error)
    return {
      hasActivePlan: false,
      membersLimit: 0,
      currentMembers: 0,
      canAddMembers: false,
      eventsLimit: 0,
      storageLimit: 0,
    }
  }
}

// Função para obter estatísticas da igreja
export const getChurchStats = async (churchId?: number) => {
  try {
    const churchData = await getChurchData(churchId)

    return {
      membersCount: churchData.members?.length || 0,
      eventsCount: 0, // TODO: Implementar quando houver endpoint de eventos
      donationsTotal: 0, // TODO: Implementar quando houver endpoint de doações
      attendanceRate: 0, // TODO: Implementar quando houver endpoint de presença
    }
  } catch (error) {
    console.error("Erro ao obter estatísticas da igreja:", error)
    return {
      membersCount: 0,
      eventsCount: 0,
      donationsTotal: 0,
      attendanceRate: 0,
    }
  }
}
