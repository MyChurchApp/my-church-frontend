import { getAuthToken } from "./auth.utils"

// Utilitário HTTP para fazer requisições à API
const BASE_URL = "https://demoapp.top1soft.com.br/api"

export const httpClient = {
  async get<T>(endpoint: string): Promise<T> {
    try {
      const token = getAuthToken()
      const headers: HeadersInit = {
        Accept: "text/plain",
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${endpoint.startsWith("http") ? endpoint : BASE_URL + endpoint}`, {
        method: "GET",
        headers,
        mode: "cors",
      })

      // Tratamento específico para diferentes códigos de status
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED: Token de autenticação inválido ou expirado")
      }

      if (response.status === 400) {
        throw new Error("BAD_REQUEST: Requisição inválida")
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Erro HTTP ${response.status}:`, errorText)
        throw new Error(`HTTP_ERROR_${response.status}: ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Erro na requisição GET:", error)
      throw error
    }
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const token = getAuthToken()
      const headers: HeadersInit = {
        Accept: "text/plain",
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${endpoint.startsWith("http") ? endpoint : BASE_URL + endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        mode: "cors",
      })

      // Tratamento específico para diferentes códigos de status
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED: Token de autenticação inválido ou expirado")
      }

      if (response.status === 400) {
        throw new Error("BAD_REQUEST: Requisição inválida")
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Erro HTTP ${response.status}:`, errorText)
        throw new Error(`HTTP_ERROR_${response.status}: ${errorText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Erro na requisição POST:", error)
      throw error
    }
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const token = getAuthToken()
      const headers: HeadersInit = {
        Accept: "text/plain",
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${endpoint.startsWith("http") ? endpoint : BASE_URL + endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
        mode: "cors",
      })

      // Tratamento específico para diferentes códigos de status
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED: Token de autenticação inválido ou expirado")
      }

      if (response.status === 400) {
        throw new Error("BAD_REQUEST: Requisição inválida")
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Erro HTTP ${response.status}:`, errorText)
        throw new Error(`HTTP_ERROR_${response.status}: ${errorText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Erro na requisição PUT:", error)
      throw error
    }
  },

  async delete(endpoint: string): Promise<void> {
    try {
      const token = getAuthToken()
      const headers: HeadersInit = {
        Accept: "*/*", // Aceita qualquer tipo de conteúdo, conforme Swagger
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${endpoint.startsWith("http") ? endpoint : BASE_URL + endpoint}`, {
        method: "DELETE",
        headers,
        mode: "cors",
      })

      // Tratamento específico para diferentes códigos de status
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED: Token de autenticação inválido ou expirado")
      }

      if (response.status === 400) {
        throw new Error("BAD_REQUEST: Requisição inválida")
      }

      // 204 No Content é um sucesso para DELETE, não precisa retornar dados
      if (response.status !== 204 && !response.ok) {
        const errorText = await response.text()
        console.error(`Erro HTTP ${response.status}:`, errorText)
        throw new Error(`HTTP_ERROR_${response.status}: ${errorText}`)
      }

      // Não tenta ler o corpo para 204 No Content
      return
    } catch (error) {
      console.error("Erro na requisição DELETE:", error)
      throw error
    }
  },
}
