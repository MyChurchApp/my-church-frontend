import { authFetch } from "@/lib/auth-fetch"

// Interface para os dados da assinatura
export interface Subscription {
  id: number
  churchId: number
  planId: number
  plan: {
    id: number
    name: string
    price: number
    maxMembers: number
    maxEvents: number
    maxStorageGB: number
  }
  startDate: string
  endDate: string
  isActive: boolean
  payments: Payment[]
}

// Interface para os pagamentos
export interface Payment {
  id: number
  subscriptionId: number
  amount: number
  date: string
  paymentStatus: string
  transactionId: string
}

// Interface para os dados formatados da assinatura
export interface FormattedSubscription {
  plan: string
  status: string
  price: string
  nextBilling: string
  paymentMethod: string
  includedFeatures: string[]
}

// Função para obter os dados da assinatura
export async function getSubscriptionData(): Promise<FormattedSubscription> {
  try {
    // Obter dados da igreja para pegar a assinatura
    const churchData = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Church`)

    if (!churchData || !churchData.subscription) {
      throw new Error("Dados da assinatura não encontrados")
    }

    const subscription = churchData.subscription

    // Formatar os dados da assinatura
    return {
      plan: subscription.plan?.name || "Plano Básico",
      status: subscription.isActive ? "Ativo" : "Inativo",
      price: subscription.plan?.price?.toFixed(2).replace(".", ",") || "0,00",
      nextBilling: getNextBillingDate(subscription.startDate),
      paymentMethod: getPaymentMethod(subscription.payments),
      includedFeatures: getIncludedFeatures(subscription.plan),
    }
  } catch (error) {
    console.error("Erro ao obter dados da assinatura:", error)

    // Retornar dados padrão em caso de erro
    return {
      plan: "Plano Básico",
      status: "Ativo",
      price: "149,90",
      nextBilling: "15/07/2025",
      paymentMethod: "Cartão de Crédito",
      includedFeatures: ["Gestão de membros", "Controle financeiro", "Agenda de eventos", "Comunicação"],
    }
  }
}

// Função para calcular a próxima data de cobrança
function getNextBillingDate(startDate: string): string {
  try {
    const start = new Date(startDate)
    const today = new Date()

    // Calcular próxima data de cobrança (mesmo dia do mês seguinte)
    const nextBilling = new Date(today.getFullYear(), today.getMonth() + 1, start.getDate())

    // Formatar a data
    return nextBilling.toLocaleDateString("pt-BR")
  } catch (error) {
    return "15/07/2025" // Data padrão
  }
}

// Função para obter o método de pagamento
function getPaymentMethod(payments: Payment[] | undefined): string {
  if (!payments || payments.length === 0) {
    return "Cartão de Crédito"
  }

  // Pegar o método do último pagamento
  const lastPayment = payments[payments.length - 1]

  // Aqui você pode implementar uma lógica mais complexa baseada no paymentStatus
  return "Cartão de Crédito"
}

// Função para obter os recursos inclusos no plano
function getIncludedFeatures(plan: any): string[] {
  if (!plan) {
    return ["Gestão de membros", "Controle financeiro", "Agenda de eventos", "Comunicação"]
  }

  // Aqui você pode implementar uma lógica baseada nos dados do plano
  const features = []

  if (plan.maxMembers) {
    features.push(`Até ${plan.maxMembers} membros`)
  }

  if (plan.maxEvents) {
    features.push(`Até ${plan.maxEvents} eventos`)
  }

  if (plan.maxStorageGB) {
    features.push(`${plan.maxStorageGB}GB de armazenamento`)
  }

  // Adicionar recursos padrão
  features.push("Gestão de membros")
  features.push("Controle financeiro")
  features.push("Agenda de eventos")
  features.push("Comunicação")

  return features
}
