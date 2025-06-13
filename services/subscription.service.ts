// Interface para dados da assinatura
export interface Subscription {
  id: number
  churchId: number
  plan: string
  status: string
  price: string
  nextBilling: string
  paymentMethod: string
  includedFeatures: string[]
}

// Função para obter dados da assinatura
export const getSubscriptionData = async (): Promise<Subscription> => {
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

    // Em um ambiente real, faríamos uma requisição para a API
    // const response = await authFetch(`https://demoapp.top1soft.com.br/api/Subscription/${churchId}`)
    // const data = await response.json()

    // Por enquanto, retornar dados simulados
    return {
      id: 1,
      churchId: churchId,
      plan: "Plano Básico",
      status: "Ativo",
      price: "149,90",
      nextBilling: "15/07/2025",
      paymentMethod: "Cartão de Crédito",
      includedFeatures: ["Gestão de membros", "Controle financeiro", "Agenda de eventos", "Comunicação"],
    }
  } catch (error) {
    console.error("Erro ao obter dados da assinatura:", error)

    // Retornar dados padrão em caso de erro
    return {
      id: 0,
      churchId: 0,
      plan: "Plano Básico",
      status: "Ativo",
      price: "149,90",
      nextBilling: "15/07/2025",
      paymentMethod: "Cartão de Crédito",
      includedFeatures: ["Gestão de membros", "Controle financeiro", "Agenda de eventos", "Comunicação"],
    }
  }
}
