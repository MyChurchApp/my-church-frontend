import { authFetch } from "@/lib/auth-fetch"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br"

export interface TransferRequest {
  notes: string
}

export interface TransferResponse {
  success: boolean
  message?: string
}

export class DonationTransferService {
  private static cleanBaseUrl(url: string): string {
    return url.replace(/\/api$/, "")
  }

  /**
   * Consultar saldo disponível para transferência
   * A API retorna o valor direto (ex: 564.33)
   */
  static async getTransferBalance(): Promise<number> {
    console.log("[DonationTransferService] Consultando saldo disponível...")

    const cleanUrl = this.cleanBaseUrl(BASE_URL)
    const url = `${cleanUrl}/api/Donation/transfer-balance`

    console.log("[DonationTransferService] URL final:", url)

    try {
      const response = await authFetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      // A API retorna o valor direto (ex: 564.33)
      const balance = await response.json()
      console.log("[DonationTransferService] Saldo obtido:", balance)

      // Garantir que é um número
      const numericBalance = typeof balance === "number" ? balance : Number.parseFloat(balance) || 0

      return numericBalance
    } catch (error) {
      console.error("[DonationTransferService] Erro ao consultar saldo:", error)
      throw error
    }
  }

  /**
   * Efetuar transferência
   */
  static async transfer(request: TransferRequest): Promise<TransferResponse> {
    console.log("[DonationTransferService] Efetuando transferência...", request)

    const cleanUrl = this.cleanBaseUrl(BASE_URL)
    const url = `${cleanUrl}/api/Donation/transfer`

    console.log("[DonationTransferService] URL final:", url)

    try {
      const response = await authFetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[DonationTransferService] Transferência realizada:", data)

      return { success: true, ...data }
    } catch (error) {
      console.error("[DonationTransferService] Erro ao efetuar transferência:", error)
      throw error
    }
  }
}
