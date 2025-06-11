import { authFetch } from "@/lib/auth-fetch"

export class DonationsDebugService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br"

  async testEndpoints() {
    const endpoints = ["/api/Donation/paid", "/api/donation/paid", "/api/Donations/paid", "/api/donations/paid"]


    for (const endpoint of endpoints) {
      try {
        const url = `${this.baseUrl}${endpoint}`

        const response = await authFetch(url)

        if (response.ok) {
          const data = await response.json()
          return { endpoint, data }
        }
      } catch (error) {
      }
    }

    return null
  }

  async checkApiHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`)
      return response.ok
    } catch (error) {
      return false
    }
  }
}

export const donationsDebugService = new DonationsDebugService()
