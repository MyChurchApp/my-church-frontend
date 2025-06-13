import { authFetch } from "@/lib/auth-fetch"

// Interface para dados da igreja
export interface Church {
  id: number
  name: string
  logo: string | null
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
  pastor?: string
  email?: string
}

// Função para obter dados da igreja
export const getChurchData = async (): Promise<Church> => {
  try {
    // Tentar obter o ID da igreja do localStorage ou token
    let churchId = 0

    // Verificar se temos um token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken")
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          churchId = payload.churchId || 0
        } catch (error) {
          console.error("Erro ao decodificar token para obter churchId:", error)
        }
      }

      // Verificar se temos o churchId no localStorage
      const user = localStorage.getItem("user")
      if (user) {
        try {
          const userData = JSON.parse(user)
          if (userData.churchId) {
            churchId = userData.churchId
          }
        } catch (error) {
          console.error("Erro ao parsear dados do usuário para obter churchId:", error)
        }
      }
    }

    if (!churchId) {
      throw new Error("ID da igreja não encontrado")
    }

    // Fazer a requisição para a API
    const response = await authFetch(`https://demoapp.top1soft.com.br/api/Church/${churchId}`)

    if (!response.ok) {
      throw new Error(`Erro ao obter dados da igreja: ${response.status}`)
    }

    const data = await response.json()

    // Adicionar campos extras que podem ser necessários na interface
    return {
      ...data,
      pastor: data.pastor || "",
      email: data.email || "",
    }
  } catch (error) {
    console.error("Erro ao obter dados da igreja:", error)

    // Retornar dados padrão em caso de erro
    return {
      id: 0,
      name: "Igreja",
      logo: null,
      address: {
        id: 0,
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Brasil",
        neighborhood: "",
      },
      phone: "",
      description: "",
      pastor: "",
      email: "",
    }
  }
}
