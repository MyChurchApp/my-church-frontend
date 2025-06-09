export interface CreditCard {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
}

export interface CreditCardHolderInfo {
  name: string
  email: string
  cpfCnpj: string
  postalCode: string
  addressNumber: string
  phone: string
}

export interface DonationRequest {
  value: number
  description: string
  billingType: "CREDIT_CARD" | "PIX"
  dueDate: string
  creditCard?: CreditCard
  creditCardHolderInfo?: CreditCardHolderInfo
}

export interface PixQrCode {
  encodedImage: string
  payload: string
  expirationDate: string
}

export interface DonationResponse {
  donationId: number
  paymentLink: string
  status: string
  pixQrCode?: PixQrCode
}

class DonationService {
  private baseUrl = "https://demoapp.top1soft.com.br"

  async createDonation(donation: DonationRequest): Promise<DonationResponse> {
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("Token de autenticação não encontrado")
    }

    // Preparar payload baseado no tipo de pagamento
    const payload: any = {
      value: donation.value,
      description: donation.description,
      billingType: donation.billingType,
      dueDate: donation.dueDate,
    }

    // Só adicionar dados do cartão se for CREDIT_CARD
    if (donation.billingType === "CREDIT_CARD") {
      payload.creditCard = donation.creditCard
      payload.creditCardHolderInfo = donation.creditCardHolderInfo
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/Donation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Não autorizado. Faça login novamente.")
        }
        if (response.status === 400) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Dados inválidos para a doação")
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Erro ao criar doação:", error)
      throw error
    }
  }

  // Método para validar dados do cartão
  validateCreditCard(card: CreditCard): string[] {
    const errors: string[] = []

    if (!card.holderName.trim()) {
      errors.push("Nome do portador é obrigatório")
    }

    if (!card.number.replace(/\s/g, "")) {
      errors.push("Número do cartão é obrigatório")
    } else if (card.number.replace(/\s/g, "").length < 13) {
      errors.push("Número do cartão deve ter pelo menos 13 dígitos")
    }

    if (!card.expiryMonth || !card.expiryYear) {
      errors.push("Data de validade é obrigatória")
    }

    if (!card.ccv) {
      errors.push("CCV é obrigatório")
    } else if (card.ccv.length < 3) {
      errors.push("CCV deve ter pelo menos 3 dígitos")
    }

    return errors
  }

  // Método para validar dados do portador
  validateCardHolderInfo(info: CreditCardHolderInfo): string[] {
    const errors: string[] = []

    if (!info.name.trim()) {
      errors.push("Nome é obrigatório")
    }

    if (!info.email.trim()) {
      errors.push("Email é obrigatório")
    } else if (!/\S+@\S+\.\S+/.test(info.email)) {
      errors.push("Email inválido")
    }

    if (!info.cpfCnpj.trim()) {
      errors.push("CPF/CNPJ é obrigatório")
    }

    if (!info.postalCode.trim()) {
      errors.push("CEP é obrigatório")
    }

    if (!info.addressNumber.trim()) {
      errors.push("Número do endereço é obrigatório")
    }

    if (!info.phone.trim()) {
      errors.push("Telefone é obrigatório")
    }

    return errors
  }

  // Método para formatar número do cartão
  formatCardNumber(value: string): string {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  // Método para formatar CPF/CNPJ
  formatCpfCnpj(value: string): string {
    const v = value.replace(/\D/g, "")

    if (v.length <= 11) {
      // CPF
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else {
      // CNPJ
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
  }

  // Método para formatar CEP
  formatCep(value: string): string {
    const v = value.replace(/\D/g, "")
    return v.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  // Método para formatar data de expiração
  formatExpirationDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }
}

export const donationService = new DonationService()
