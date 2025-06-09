import { authFetch, testAuthToken } from "@/lib/auth-fetch"
import { isAuthenticated } from "@/lib/api"

export enum BirthdayFilterType {
  Day = 0,
  Week = 1,
  Month = 2,
}

export interface BirthdayMember {
  id: number
  name: string
  email?: string
  phone?: string
  photo?: string
  birthDate: string
  birthdayThisYear?: Date
  age?: number
  daysUntilBirthday?: number
}

export class MembersService {
  /**
   * Obtém os aniversariantes do dia atual
   */
  static async getDailyBirthdays(): Promise<BirthdayMember[]> {
    return this.getBirthdays(BirthdayFilterType.Day)
  }

  /**
   * Obtém os aniversariantes da semana atual
   */
  static async getWeeklyBirthdays(): Promise<BirthdayMember[]> {
    return this.getBirthdays(BirthdayFilterType.Week)
  }

  /**
   * Obtém os aniversariantes do mês atual
   */
  static async getMonthlyBirthdays(): Promise<BirthdayMember[]> {
    return this.getBirthdays(BirthdayFilterType.Month)
  }

  /**
   * Obtém os aniversariantes com base no tipo de filtro
   */
  static async getBirthdays(filterType: BirthdayFilterType): Promise<BirthdayMember[]> {
    if (!isAuthenticated()) {
      throw new Error("Usuário não autenticado")
    }

    // Debug do token antes da requisição
    console.log("🔍 Debugando autenticação antes da requisição:")
    testAuthToken()

    try {
      // Construir a URL correta baseada na variável de ambiente
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br"
      // Remover /api duplicado - a URL base já deve incluir o caminho completo
      const url = `${baseUrl}/Member/birthdays?filterType=${filterType}`

      console.log("📡 Fazendo requisição para aniversários:")
      console.log(`🔗 URL: ${url}`)
      console.log(`🎯 FilterType: ${filterType} (${BirthdayFilterType[filterType]})`)

      const response = await authFetch(url)

      console.log("📊 Resposta recebida:")
      console.log(`📊 Status: ${response.status}`)
      console.log(`📊 Status Text: ${response.statusText}`)
      console.log(`📊 Headers:`, Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("⚠️ Endpoint de aniversários não encontrado (404). Usando dados fake como fallback.")
          return []
        }

        if (response.status === 401) {
          console.error("❌ Não autorizado (401). Problemas com o token:")
          testAuthToken()
          throw new Error("Token de autenticação inválido ou expirado")
        }

        const errorText = await response.text().catch(() => "Erro desconhecido")
        console.error("❌ Erro na resposta da API:", errorText)
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      const members: BirthdayMember[] = await response.json()
      console.log(`✅ Aniversariantes recebidos: ${members.length}`)
      console.log("📋 Dados recebidos:", members)

      // Processar os dados para adicionar informações úteis
      return members
        .map((member) => {
          const birthDate = new Date(member.birthDate)
          const today = new Date()
          const age = this.calculateAge(member.birthDate)

          // Calcular a data do aniversário deste ano
          const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())

          // Se o aniversário já passou este ano, calcular para o próximo ano
          if (birthdayThisYear < today) {
            birthdayThisYear.setFullYear(today.getFullYear() + 1)
          }

          // Calcular dias até o aniversário
          const daysUntilBirthday = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          return {
            ...member,
            birthdayThisYear,
            age,
            daysUntilBirthday: daysUntilBirthday === 0 ? 0 : daysUntilBirthday,
          }
        })
        .sort((a, b) => (a.daysUntilBirthday || 0) - (b.daysUntilBirthday || 0))
    } catch (error) {
      console.error("❌ Erro detalhado ao buscar aniversariantes:", error)

      // Se for erro de rede ou 404, retornar array vazio para usar fallback
      if (error instanceof Error) {
        if (error.message.includes("404") || error.message.includes("fetch")) {
          console.warn("⚠️ Usando fallback devido a erro de rede ou endpoint não encontrado")
          return []
        }
      }

      throw error
    }
  }

  /**
   * Calcula a idade com base na data de nascimento
   */
  static calculateAge(birthDateStr: string): number {
    const birthDate = new Date(birthDateStr)
    const today = new Date()

    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  /**
   * Formata a data de aniversário para exibição
   */
  static formatBirthdayDate(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  /**
   * Testa a conectividade com a API de membros
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log("🔍 Testando conectividade com API de membros...")
      testAuthToken()

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br"
      // Remover /api duplicado
      const url = `${baseUrl}/Member/birthdays?filterType=1`

      console.log(`🔗 URL de teste: ${url}`)

      const response = await authFetch(url)

      console.log(`📊 Status do teste: ${response.status}`)

      const isConnected = response.status !== 404
      console.log(`✅ Conectividade: ${isConnected ? "OK" : "Falhou"}`)

      return isConnected
    } catch (error) {
      console.error("❌ Erro ao testar conexão:", error)
      return false
    }
  }
}
