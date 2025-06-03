// Service para gerenciar todas as requisições da API de Financeiro (CashFlow)
import { authFetchJson } from "@/lib/auth-fetch"

const API_BASE_URL = "https://demoapp.top1soft.com.br/api"

// Tipos baseados no Swagger
export interface CashFlowItem {
  id: number
  amount: number
  date: string
  description: string
  type: number // 0 = Entrada, 1 = Saída
  churchId: number
  churchName: string
  memberId: number
  memberName: string
  categoryId: number
  categoryName: string
  created: string
  updated: string
}

export interface CashFlowResponse {
  items: CashFlowItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CashFlowListResponse {
  result: CashFlowResponse
  balance: number
}

export interface CashFlowCategory {
  id: number
  name: string
  description: string
  churchId: number
  churchName: string
}

export interface CashFlowCategoriesResponse {
  items: CashFlowCategory[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CreateCategoryRequest {
  name: string
  description: string
}

export interface CreateCashFlowRequest {
  amount: number
  date: string
  description: string
  type: number
  categoryId: number
}

export interface CashFlowFilters {
  amount?: number
  date?: string
  startDate?: string
  endDate?: string
  type?: number
  categoryId?: number
  pageNumber?: number
  pageSize?: number
}

// Função para fazer requisições com autenticação
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  console.log(`🔗 API Request para: ${API_BASE_URL}${endpoint}`)
  console.log(`📋 Método: ${options.method || "GET"}`)
  return authFetchJson<T>(`${API_BASE_URL}${endpoint}`, options)
}

// ==================== EXPORTAÇÕES PRINCIPAIS ====================

export async function createCashFlow(data: CreateCashFlowRequest): Promise<string> {
  console.log("💰 Criando lançamento de fluxo de caixa:", data)
  return apiRequest<string>("/CashFlow", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getCashFlowList(filters: CashFlowFilters = {}): Promise<{
  transactions: CashFlowResponse
  balance: number
}> {
  console.log("📋 Buscando lista de fluxo de caixa com filtros:", filters)

  const params = new URLSearchParams()

  if (filters.amount !== undefined) {
    params.append("Amount", filters.amount.toString())
  }
  if (filters.date) {
    params.append("Date", filters.date)
  }
  if (filters.startDate) {
    params.append("StartDate", filters.startDate)
  }
  if (filters.endDate) {
    params.append("EndDate", filters.endDate)
  }
  if (filters.type !== undefined) {
    params.append("Type", filters.type.toString())
  }
  if (filters.categoryId !== undefined) {
    params.append("CategoryId", filters.categoryId.toString())
  }
  if (filters.pageNumber !== undefined) {
    params.append("PageNumber", filters.pageNumber.toString())
  }
  if (filters.pageSize !== undefined) {
    params.append("PageSize", filters.pageSize.toString())
  }

  const queryString = params.toString()
  const endpoint = queryString ? `/CashFlow?${queryString}` : "/CashFlow"

  try {
    const response = await apiRequest<CashFlowListResponse>(endpoint)

    if (response && response.result && response.result.items && Array.isArray(response.result.items)) {
      return {
        transactions: response.result,
        balance: response.balance,
      }
    } else {
      return {
        transactions: {
          items: [],
          pageNumber: 1,
          pageSize: 0,
          totalCount: 0,
          totalPages: 0,
        },
        balance: 0,
      }
    }
  } catch (error) {
    console.error("❌ Erro ao buscar lista de fluxo de caixa:", error)
    throw error
  }
}

export async function updateCashFlow(id: number, data: CreateCashFlowRequest): Promise<CashFlowItem> {
  console.log(`✏️ Atualizando fluxo de caixa ID ${id}:`, data)
  return apiRequest<CashFlowItem>(`/CashFlow/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteCashFlow(id: number): Promise<void> {
  console.log(`🗑️ Excluindo fluxo de caixa ID: ${id}`)
  return apiRequest<void>(`/CashFlow/${id}`, {
    method: "DELETE",
  })
}

export async function createCashFlowCategory(data: {
  name: string
  description: string
}): Promise<string> {
  console.log("🏷️ Criando categoria:", data)

  const apiData: CreateCategoryRequest = {
    name: data.name,
    description: data.description || "",
  }

  try {
    const result = await apiRequest<string>("/CashFlow/categories", {
      method: "POST",
      body: JSON.stringify(apiData),
    })
    return result
  } catch (error) {
    console.error("❌ Erro ao criar categoria:", error)
    throw error
  }
}

export async function getCashFlowCategories(): Promise<CashFlowCategory[]> {
  console.log("🏷️ Buscando categorias de fluxo de caixa...")

  try {
    const result = await apiRequest<CashFlowCategoriesResponse>("/CashFlow/categories")

    if (result && result.items && Array.isArray(result.items)) {
      return result.items
    } else {
      return []
    }
  } catch (error) {
    console.error("❌ Erro ao buscar categorias:", error)
    throw error
  }
}

export async function updateCashFlowCategory(id: number, data: CreateCategoryRequest): Promise<CashFlowCategory> {
  console.log(`✏️ Atualizando categoria ID ${id}:`, data)
  return apiRequest<CashFlowCategory>(`/CashFlow/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteCashFlowCategory(id: number): Promise<void> {
  console.log(`🗑️ Excluindo categoria ID: ${id}`)

  try {
    const response = await apiRequest<void>(`/CashFlow/categories/${id}`, {
      method: "DELETE",
    })
    return response
  } catch (error) {
    console.error(`❌ Erro ao excluir categoria ID ${id}:`, error)

    if (error instanceof Error) {
      const errorMessage = error.message

      if (errorMessage.includes("expected to affect 1 row(s), but actually affected 0 row(s)")) {
        throw new Error("Categoria não encontrada ou já foi excluída por outro usuário")
      } else if (errorMessage.includes("foreign key constraint")) {
        throw new Error("Categoria não pode ser excluída pois está sendo usada em transações")
      } else if (errorMessage.includes("401")) {
        throw new Error("Sessão expirada. Faça login novamente")
      } else if (errorMessage.includes("403")) {
        throw new Error("Permissão negada para excluir categoria")
      }
    }

    throw error
  }
}

// ==================== FUNÇÕES UTILITÁRIAS ====================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR")
}

export function formatDateToISO(date: Date): string {
  return date.toISOString()
}

export function getCashFlowTypeText(type: number): string {
  return type === 0 ? "Entrada" : "Saída"
}

export function getCashFlowTypeNumber(type: string): number {
  return type === "entrada" ? 0 : 1
}
