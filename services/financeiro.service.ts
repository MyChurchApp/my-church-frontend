// Service para gerenciar todas as requisições da API de Financeiro (CashFlow)
// ✅ CORRIGIDO para lidar com a estrutura real da resposta da API

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

// ✅ NOVO: Interface para a resposta real da API que inclui result e balance
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

// Interface para resposta paginada das categorias
export interface CashFlowCategoriesResponse {
  items: CashFlowCategory[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// Interface simplificada conforme a API espera
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

// ✅ Função para fazer requisições com autenticação GARANTIDA
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  console.log(`🔗 API Request para: ${API_BASE_URL}${endpoint}`)
  console.log(`📋 Método: ${options.method || "GET"}`)
  return authFetchJson<T>(`${API_BASE_URL}${endpoint}`, options)
}

// ==================== LANÇAMENTOS DE FLUXO DE CAIXA ====================

/**
 * ✅ Cria um novo lançamento de fluxo de caixa
 */
export async function createCashFlow(data: CreateCashFlowRequest): Promise<string> {
  console.log("💰 Criando lançamento de fluxo de caixa:", data)
  return apiRequest<string>("/CashFlow", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * ✅ Lista lançamentos de fluxo de caixa com filtros opcionais
 * CORRIGIDO: Agora lida com a estrutura real da resposta { result, balance }
 */
export async function getCashFlowList(filters: CashFlowFilters = {}): Promise<{
  transactions: CashFlowResponse
  balance: number
}> {
  console.log("📋 Buscando lista de fluxo de caixa com filtros:", filters)

  const params = new URLSearchParams()

  // ✅ Adicionar todos os filtros disponíveis conforme a API
  if (filters.amount !== undefined) {
    params.append("Amount", filters.amount.toString())
    console.log(`🔍 Filtro Amount: ${filters.amount}`)
  }

  if (filters.date) {
    params.append("Date", filters.date)
    console.log(`🔍 Filtro Date: ${filters.date}`)
  }

  if (filters.startDate) {
    params.append("StartDate", filters.startDate)
    console.log(`🔍 Filtro StartDate: ${filters.startDate}`)
  }

  if (filters.endDate) {
    params.append("EndDate", filters.endDate)
    console.log(`🔍 Filtro EndDate: ${filters.endDate}`)
  }

  if (filters.type !== undefined) {
    params.append("Type", filters.type.toString())
    console.log(`🔍 Filtro Type: ${filters.type}`)
  }

  if (filters.categoryId !== undefined) {
    params.append("CategoryId", filters.categoryId.toString())
    console.log(`🔍 Filtro CategoryId: ${filters.categoryId}`)
  }

  if (filters.pageNumber !== undefined) {
    params.append("PageNumber", filters.pageNumber.toString())
    console.log(`🔍 Filtro PageNumber: ${filters.pageNumber}`)
  }

  if (filters.pageSize !== undefined) {
    params.append("PageSize", filters.pageSize.toString())
    console.log(`🔍 Filtro PageSize: ${filters.pageSize}`)
  }

  const queryString = params.toString()
  const endpoint = queryString ? `/CashFlow?${queryString}` : "/CashFlow"

  console.log(`🔗 Endpoint final: ${endpoint}`)

  try {
    // ✅ CORRIGIDO: A API retorna { result: {...}, balance: number }
    const response = await apiRequest<CashFlowListResponse>(endpoint)
    console.log("✅ Resposta completa da API:", response)

    // ✅ CORRIGIDO: Extrair result e balance da resposta
    if (response && response.result && response.result.items && Array.isArray(response.result.items)) {
      console.log(`✅ Total de transações: ${response.result.items.length} (${response.result.totalCount} no total)`)
      console.log(`💰 Saldo atual: ${response.balance}`)

      return {
        transactions: response.result,
        balance: response.balance,
      }
    } else {
      console.warn("⚠️ Resposta não tem estrutura esperada:", response)
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

/**
 * ✅ Busca um lançamento de fluxo de caixa por ID
 */
export async function getCashFlowById(id: number): Promise<CashFlowItem> {
  console.log(`🔍 Buscando fluxo de caixa por ID: ${id}`)
  return apiRequest<CashFlowItem>(`/CashFlow/${id}`)
}

/**
 * ✅ Atualiza um lançamento de fluxo de caixa existente
 */
export async function updateCashFlow(id: number, data: CreateCashFlowRequest): Promise<CashFlowItem> {
  console.log(`✏️ Atualizando fluxo de caixa ID ${id}:`, data)
  return apiRequest<CashFlowItem>(`/CashFlow/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * ✅ Exclui um lançamento de fluxo de caixa
 */
export async function deleteCashFlow(id: number): Promise<void> {
  console.log(`🗑️ Excluindo fluxo de caixa ID: ${id}`)
  return apiRequest<void>(`/CashFlow/${id}`, {
    method: "DELETE",
  })
}

// ==================== CATEGORIAS ====================

/**
 * ✅ Cria uma nova categoria de fluxo de caixa
 */
export async function createCashFlowCategory(data: {
  name: string
  description: string
}): Promise<string> {
  console.log("🏷️ Criando categoria:", data)

  // Payload simplificado conforme a API espera
  const apiData: CreateCategoryRequest = {
    name: data.name,
    description: data.description || "",
  }

  console.log("📤 Payload para API:", apiData)

  try {
    const result = await apiRequest<string>("/CashFlow/categories", {
      method: "POST",
      body: JSON.stringify(apiData),
    })

    console.log("✅ Categoria criada com sucesso:", result)
    return result
  } catch (error) {
    console.error("❌ Erro ao criar categoria:", error)
    throw error
  }
}

/**
 * ✅ Lista todas as categorias de fluxo de caixa da igreja
 * CORRIGIDO: Lida com resposta paginada e garante "Bearer "
 */
export async function getCashFlowCategories(): Promise<CashFlowCategory[]> {
  console.log("🏷️ Buscando categorias de fluxo de caixa...")

  try {
    // ✅ A API retorna uma resposta paginada, não um array direto
    const result = await apiRequest<CashFlowCategoriesResponse>("/CashFlow/categories")
    console.log("✅ Resposta completa das categorias:", result)

    // ✅ Extrair o array items da resposta paginada
    if (result && result.items && Array.isArray(result.items)) {
      console.log(`✅ Total de categorias: ${result.items.length} (${result.totalCount} no total)`)
      return result.items
    } else {
      console.warn("⚠️ API não retornou items válidos:", result)
      return []
    }
  } catch (error) {
    console.error("❌ Erro ao buscar categorias:", error)
    throw error
  }
}

/**
 * ✅ Atualiza uma categoria de fluxo de caixa existente
 */
export async function updateCashFlowCategory(id: number, data: CreateCategoryRequest): Promise<CashFlowCategory> {
  console.log(`✏️ Atualizando categoria ID ${id}:`, data)
  return apiRequest<CashFlowCategory>(`/CashFlow/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * ✅ Exclui uma categoria de fluxo de caixa
 */
export async function deleteCashFlowCategory(id: number): Promise<void> {
  console.log(`🗑️ Excluindo categoria ID: ${id}`)
  return apiRequest<void>(`/CashFlow/categories/${id}`, {
    method: "DELETE",
  })
}

// ==================== SALDO ====================

/**
 * ✅ Retorna o saldo consolidado do fluxo de caixa da igreja
 * NOTA: O saldo já vem na resposta da listagem, mas mantemos esta função para compatibilidade
 */
export async function getCashFlowBalance(): Promise<number> {
  console.log("💰 Buscando saldo do fluxo de caixa...")
  try {
    const result = await apiRequest<number>("/CashFlow/balance")
    console.log("✅ Saldo recebido:", result)
    return result
  } catch (error) {
    console.error("❌ Erro ao buscar saldo:", error)
    throw error
  }
}

// ==================== FUNÇÕES UTILITÁRIAS ====================

/**
 * Formata valor monetário para exibição
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Formata data para exibição
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR")
}

/**
 * Formata data para envio à API (ISO string)
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString()
}

/**
 * Converte tipo numérico para texto
 */
export function getCashFlowTypeText(type: number): string {
  return type === 0 ? "Entrada" : "Saída"
}

/**
 * Converte texto para tipo numérico
 */
export function getCashFlowTypeNumber(type: string): number {
  return type === "entrada" ? 0 : 1
}

/**
 * Valida se uma data está no formato correto
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Gera filtros para período (últimos 30 dias, mês atual, etc.)
 */
export function getDateRangeFilters(period: "last30days" | "currentMonth" | "currentYear"): {
  startDate: string
  endDate: string
} {
  const now = new Date()
  const endDate = formatDateToISO(now)

  let startDate: string

  switch (period) {
    case "last30days":
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      startDate = formatDateToISO(thirtyDaysAgo)
      break
    case "currentMonth":
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      startDate = formatDateToISO(firstDayOfMonth)
      break
    case "currentYear":
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1)
      startDate = formatDateToISO(firstDayOfYear)
      break
    default:
      startDate = endDate
  }

  return { startDate, endDate }
}
