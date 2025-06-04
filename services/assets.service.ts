// Service para gerenciar todas as requisições da API de Ativos (Assets)
import { authFetchJson } from "@/lib/auth-fetch"

const API_BASE_URL = "https://demoapp.top1soft.com.br/api"

// Tipos baseados no Swagger
export interface Asset {
  id: number
  name: string
  value: number
  description: string
  photo: string
  type: number // 1 = Equipamento, 2 = Mobiliário, 3 = Veículo, 4 = Imóvel, 5 = Tecnologia, 6 = Outros
  identificationCode: string
  churchId: number
  createdAt: string
  condition: string
  purchaseDate: string
  location: string
  responsible: string
  lastMaintenance: string
  nextMaintenance: string
  warrantyUntil: string
  notes: string
}

export interface AssetsResponse {
  items: Asset[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CreateAssetRequest {
  name: string
  value: number
  description: string
  photo: string
  type: number
  identificationCode: string
  condition: string
  purchaseDate: string
  location: string
  responsible: string
  lastMaintenance: string
  nextMaintenance: string
  warrantyUntil: string
  notes: string
}

export interface UpdateAssetRequest extends CreateAssetRequest {
  id: number
}

export interface AssetFilters {
  name?: string
  description?: string
  value?: number
  type?: number
  identificationCode?: string
  condition?: string
  purchaseDate?: string
  location?: string
  responsible?: string
  lastMaintenance?: string
  nextMaintenance?: string
  warrantyUntil?: string
  notes?: string
  page?: number
  pageSize?: number
}

// Função para fazer requisições com autenticação
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  console.log(`🔗 API Request para: ${API_BASE_URL}${endpoint}`)
  console.log(`📋 Método: ${options.method || "GET"}`)
  return authFetchJson<T>(`${API_BASE_URL}${endpoint}`, options)
}

// ==================== EXPORTAÇÕES PRINCIPAIS ====================

export async function createAsset(data: CreateAssetRequest): Promise<Asset> {
  console.log("🏢 Criando ativo:", data)
  return apiRequest<Asset>("/Asset", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getAssets(filters: AssetFilters = {}): Promise<AssetsResponse> {
  console.log("📋 Buscando lista de ativos com filtros:", filters)

  const params = new URLSearchParams()

  if (filters.name) {
    params.append("Name", filters.name)
  }
  if (filters.description) {
    params.append("Description", filters.description)
  }
  if (filters.value !== undefined) {
    params.append("Value", filters.value.toString())
  }
  if (filters.type !== undefined) {
    params.append("Type", filters.type.toString())
  }
  if (filters.identificationCode) {
    params.append("IdentificationCode", filters.identificationCode)
  }
  if (filters.condition) {
    params.append("Condition", filters.condition)
  }
  if (filters.purchaseDate) {
    params.append("PurchaseDate", filters.purchaseDate)
  }
  if (filters.location) {
    params.append("Location", filters.location)
  }
  if (filters.responsible) {
    params.append("Responsible", filters.responsible)
  }
  if (filters.lastMaintenance) {
    params.append("LastMaintenance", filters.lastMaintenance)
  }
  if (filters.nextMaintenance) {
    params.append("NextMaintenance", filters.nextMaintenance)
  }
  if (filters.warrantyUntil) {
    params.append("WarrantyUntil", filters.warrantyUntil)
  }
  if (filters.notes) {
    params.append("Notes", filters.notes)
  }
  if (filters.page !== undefined) {
    params.append("Page", filters.page.toString())
  }
  if (filters.pageSize !== undefined) {
    params.append("PageSize", filters.pageSize.toString())
  }

  const queryString = params.toString()
  const endpoint = queryString ? `/Asset?${queryString}` : "/Asset"

  try {
    const response = await apiRequest<AssetsResponse>(endpoint)

    if (response && response.items && Array.isArray(response.items)) {
      return response
    } else {
      return {
        items: [],
        pageNumber: 1,
        pageSize: 0,
        totalCount: 0,
        totalPages: 0,
      }
    }
  } catch (error) {
    console.error("❌ Erro ao buscar lista de ativos:", error)
    throw error
  }
}

export async function getAssetById(id: number): Promise<Asset> {
  console.log(`🔍 Buscando ativo ID: ${id}`)
  return apiRequest<Asset>(`/Asset/${id}`)
}

export async function updateAsset(id: number, data: CreateAssetRequest): Promise<Asset> {
  console.log(`✏️ Atualizando ativo ID ${id}:`, data)
  return apiRequest<Asset>(`/Asset/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteAsset(id: number): Promise<void> {
  console.log(`🗑️ Excluindo ativo ID: ${id}`)
  return apiRequest<void>(`/Asset/${id}`, {
    method: "DELETE",
  })
}

// ==================== FUNÇÕES UTILITÁRIAS ====================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString("pt-BR")
}

export function formatDateToISO(date: Date): string {
  return date.toISOString()
}

// Mapeamento dos tipos de ativos
export const assetTypes = {
  1: "Equipamento",
  2: "Mobiliário",
  3: "Veículo",
  4: "Imóvel",
  5: "Tecnologia",
  6: "Outros",
} as const

export const assetTypeOptions = [
  { value: 1, label: "Equipamento" },
  { value: 2, label: "Mobiliário" },
  { value: 3, label: "Veículo" },
  { value: 4, label: "Imóvel" },
  { value: 5, label: "Tecnologia" },
  { value: 6, label: "Outros" },
]

// Condições dos ativos
export const assetConditions = ["Excelente", "Bom", "Regular", "Ruim", "Em Manutenção"] as const

export const conditionColors = {
  Excelente: "bg-green-100 text-green-800",
  Bom: "bg-blue-100 text-blue-800",
  Regular: "bg-yellow-100 text-yellow-800",
  Ruim: "bg-red-100 text-red-800",
  "Em Manutenção": "bg-orange-100 text-orange-800",
} as const

export function getAssetTypeName(type: number): string {
  return assetTypes[type as keyof typeof assetTypes] || "Desconhecido"
}

export function getConditionColor(condition: string): string {
  return conditionColors[condition as keyof typeof conditionColors] || "bg-gray-100 text-gray-800"
}

// Função para converter dados do formulário para o formato da API
// IMPORTANTE: Todos os campos devem ser enviados como string vazia se não preenchidos
export function convertFormDataToApi(formData: any): CreateAssetRequest {
  // Gerar um código de identificação aleatório se não for fornecido
  const identificationCode = formData.identificationCode?.trim() || `ASSET-${Date.now().toString().slice(-6)}`

  return {
    name: formData.name?.trim() || "",
    value: Number(formData.value) || 0,
    description: formData.description?.trim() || "",
    photo: formData.photo || "",
    type: Number(formData.type) || 1,
    identificationCode: identificationCode, // Garantir que nunca seja vazio
    condition: formData.condition || "",
    purchaseDate: formData.purchaseDate ? `${formData.purchaseDate}T00:00:00.000Z` : "",
    location: formData.location?.trim() || "",
    responsible: formData.responsible?.trim() || "",
    lastMaintenance: formData.lastMaintenance ? `${formData.lastMaintenance}T00:00:00.000Z` : "",
    nextMaintenance: formData.nextMaintenance ? `${formData.nextMaintenance}T00:00:00.000Z` : "",
    warrantyUntil: formData.warrantyUntil ? `${formData.warrantyUntil}T00:00:00.000Z` : "",
    notes: formData.notes?.trim() || "",
  }
}

// Função para converter dados da API para o formato do formulário
export function convertApiDataToForm(apiData: Asset): any {
  return {
    id: apiData.id,
    name: apiData.name || "",
    value: apiData.value || 0,
    description: apiData.description || "",
    photo: apiData.photo || "",
    type: apiData.type || 1,
    identificationCode: apiData.identificationCode || "",
    condition: apiData.condition || "",
    purchaseDate: apiData.purchaseDate ? apiData.purchaseDate.split("T")[0] : "",
    location: apiData.location || "",
    responsible: apiData.responsible || "",
    lastMaintenance: apiData.lastMaintenance ? apiData.lastMaintenance.split("T")[0] : "",
    nextMaintenance: apiData.nextMaintenance ? apiData.nextMaintenance.split("T")[0] : "",
    warrantyUntil: apiData.warrantyUntil ? apiData.warrantyUntil.split("T")[0] : "",
    notes: apiData.notes || "",
  }
}
