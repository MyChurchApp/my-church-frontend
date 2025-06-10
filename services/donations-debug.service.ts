import { authFetch } from "@/lib/auth-fetch"

export class DonationsDebugService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br"

  async testEndpoints() {
    const endpoints = ["/api/Donation/paid", "/api/donation/paid", "/api/Donations/paid", "/api/donations/paid"]

    console.log("🔍 [Debug] Testando endpoints de doações...")

    for (const endpoint of endpoints) {
      try {
        const url = `${this.baseUrl}${endpoint}`
        console.log(`🔄 [Debug] Testando: ${url}`)

        const response = await authFetch(url)
        console.log(`✅ [Debug] ${endpoint} - Status: ${response.status}`)

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ [Debug] ${endpoint} - Dados:`, data)
          return { endpoint, data }
        }
      } catch (error) {
        console.log(`❌ [Debug] ${endpoint} - Erro:`, error)
      }
    }

    return null
  }

  async checkApiHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`)
      console.log(`🏥 [Debug] API Health: ${response.status}`)
      return response.ok
    } catch (error) {
      console.log(`❌ [Debug] API Health Error:`, error)
      return false
    }
  }
}

export const donationsDebugService = new DonationsDebugService()
