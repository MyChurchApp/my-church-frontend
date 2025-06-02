// Utilitários HTTP
import { API_CONFIG } from "../config/api.config"
import { getAuthToken } from "./auth.utils"

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  message: string
  status: number
  details?: any
}

export const createApiHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": API_CONFIG.HEADERS.CONTENT_TYPE,
    accept: API_CONFIG.HEADERS.ACCEPT,
  }

  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export const apiRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const headers = createApiHeaders()

    console.log(`🌐 API Request: ${options.method || "GET"} ${url}`)

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status)
    }

    const data = await response.json()
    console.log(`✅ API Response: ${options.method || "GET"} ${url}`, data)

    return {
      data,
      success: true,
    }
  } catch (error) {
    console.error(`❌ API Error: ${options.method || "GET"} ${endpoint}`, error)

    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(error instanceof Error ? error.message : "Erro desconhecido na API", 500, error)
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}
