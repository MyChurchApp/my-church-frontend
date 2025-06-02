// Apenas tipos e funções utilitárias - SEM DADOS FAKE

export interface User {
  cpf: string
  name: string
  church: string
  role: string
  accessLevel: "admin" | "member"
}

export interface ChurchData {
  id: string
  name: string
  address: string
  phone: string
  email: string
  pastor: string
  members: number
  founded: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: "culto" | "evento" | "reuniao" | "estudo"
  organizer: string
  attendees?: number
  recurrence: "once" | "weekly" | "biweekly"
  color?: string
  isRecurring?: boolean
  parentEventId?: string
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
  photo?: string
  isActive: boolean
  notes?: string
}

export interface FinanceCategory {
  id: string
  name: string
  type: "entrada" | "saida"
  description?: string
  isActive: boolean
  createdAt: string
}

export interface FinanceRecord {
  id: string
  type: "entrada" | "saida"
  categoryId: string
  categoryName: string
  description: string
  amount: number
  date: string
  method: "dinheiro" | "pix" | "cartao" | "transferencia"
  member?: string
}

// Funções utilitárias apenas
export const getUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user")
    return userData ? JSON.parse(userData) : null
  }
  return null
}

export const hasPermission = (userAccessLevel: string, requiredLevel: string): boolean => {
  if (userAccessLevel === "admin") return true
  if (requiredLevel === "member") return true
  return false
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) return "Agora mesmo"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d atrás`

  return time.toLocaleDateString("pt-BR")
}

export const eventColors = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Laranja", value: "#f59e0b" },
  { name: "Vermelho", value: "#ef4444" },
]

// Funções que retornam dados vazios - AGUARDANDO INTEGRAÇÃO COM API REAL
export const getChurchInfo = () => ({
  name: "",
  pastor: "",
  email: "",
  phone: "",
  address: "",
})

export const getSubscriptionInfo = () => ({
  plan: "",
  status: "",
  price: "",
  nextBilling: "",
  paymentMethod: "",
  features: [],
  includedFeatures: [],
})

export const getEvents = (): Event[] => []
export const getMembers = (): Member[] => []
export const getFinanceRecords = (): FinanceRecord[] => []
export const getFinanceCategories = (): FinanceCategory[] => []
export const generateRecurringEvents = (baseEvent: Event): Event[] => [baseEvent]
