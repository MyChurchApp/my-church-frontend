// Enum para tipos de filtro de aniversário
export enum BirthdayFilterType {
  Day = 0,
  Week = 1,
  Month = 2,
}

// Interface para membro aniversariante (baseada na API)
export interface ApiBirthdayMember {
  id: number
  name: string
  document: Array<{
    id: number
    memberId: number
    type: number
    number: string
  }>
  email: string
  phone: string
  photo: string | null
  birthDate: string
  isBaptized: boolean
  baptizedDate: string
  isTither: boolean
  churchId: number
  church: {
    id: number
    name: string
    logo: string
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
    members: string[]
    subscription: any
  }
  role: number
  created: string
  updated: string | null
  maritalStatus: string | null
  memberSince: string | null
  ministry: string | null
  isActive: boolean
  notes: string | null
}

// Interface para membro aniversariante processado (para uso no frontend)
export interface BirthdayMember {
  id: string
  name: string
  email: string
  phone: string
  photo: string | null
  birthDate: string
  ageWillTurn: number // Idade que fará no aniversário
  birthdayThisYear: Date
  daysUntilBirthday: number
  isToday: boolean
  birthdayMessage: string // "fará X anos hoje", "fará X anos amanhã", "fará X anos daqui X dias"
}

export class MembersService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api"

  // Função para obter o token de autenticação
  private static getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("authToken")
  }

  // Função para testar se o endpoint está disponível
  static async testConnection(): Promise<boolean> {
    try {
      const token = this.getAuthToken()
      if (!token) {
        console.log("Token não encontrado para teste de conexão")
        return false
      }

      console.log("Testando conexão com endpoint de aniversários...")
      console.log("URL:", `${this.BASE_URL}/Member/birthdays`)

      const response = await fetch(`${this.BASE_URL}/Member/birthdays?filterType=${BirthdayFilterType.Week}`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Status da resposta:", response.status)

      if (response.status === 404) {
        console.warn("Endpoint de aniversários não encontrado (404)")
        return false
      }

      if (response.status === 401) {
        console.warn("Token de autenticação inválido (401)")
        return false
      }

      if (!response.ok) {
        console.warn(`Erro na conexão: ${response.status}`)
        return false
      }

      console.log("Conexão com endpoint de aniversários bem-sucedida")
      return true
    } catch (error) {
      console.error("Erro ao testar conexão:", error)
      return false
    }
  }

  // Função para buscar aniversários da API
  static async getBirthdays(filterType: BirthdayFilterType = BirthdayFilterType.Week): Promise<ApiBirthdayMember[]> {
    try {
      const token = this.getAuthToken()
      if (!token) {
        throw new Error("Token de autenticação não encontrado")
      }

      console.log(`Buscando aniversários com filtro: ${filterType} (${BirthdayFilterType[filterType]})`)
      console.log("URL:", `${this.BASE_URL}/Member/birthdays`)

      const response = await fetch(`${this.BASE_URL}/Member/birthdays?filterType=${filterType}`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Status da resposta:", response.status)

      if (response.status === 404) {
        console.warn("Endpoint de aniversários não encontrado")
        return []
      }

      if (response.status === 401) {
        throw new Error("Token de autenticação inválido")
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erro da API:", response.status, errorText)
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data: ApiBirthdayMember[] = await response.json()
      console.log(`${data.length} aniversariantes encontrados`)

      return data
    } catch (error) {
      console.error("Erro ao buscar aniversários:", error)
      throw error
    }
  }

  // Função para buscar aniversários da semana
  static async getWeeklyBirthdays(): Promise<BirthdayMember[]> {
    try {
      const apiBirthdays = await this.getBirthdays(BirthdayFilterType.Week)
      return apiBirthdays.map((member) => this.convertApiBirthdayToLocal(member))
    } catch (error) {
      console.error("Erro ao buscar aniversários da semana:", error)
      throw error
    }
  }

  // Função para buscar aniversários do mês
  static async getMonthlyBirthdays(): Promise<BirthdayMember[]> {
    try {
      const apiBirthdays = await this.getBirthdays(BirthdayFilterType.Month)
      return apiBirthdays.map((member) => this.convertApiBirthdayToLocal(member))
    } catch (error) {
      console.error("Erro ao buscar aniversários do mês:", error)
      throw error
    }
  }

  // Função para buscar aniversários do dia
  static async getDailyBirthdays(): Promise<BirthdayMember[]> {
    try {
      const apiBirthdays = await this.getBirthdays(BirthdayFilterType.Day)
      return apiBirthdays.map((member) => this.convertApiBirthdayToLocal(member))
    } catch (error) {
      console.error("Erro ao buscar aniversários do dia:", error)
      throw error
    }
  }

  // Função para converter membro da API para formato local
  private static convertApiBirthdayToLocal(apiMember: ApiBirthdayMember): BirthdayMember {
    const birthDate = new Date(apiMember.birthDate)
    const today = new Date()
    const currentYear = today.getFullYear()

    // Calcular aniversário deste ano
    const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate())

    // Se o aniversário já passou este ano, considerar o próximo ano
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(currentYear + 1)
    }

    // Calcular idade que fará no aniversário
    const ageWillTurn = this.calculateAgeWillTurn(apiMember.birthDate, birthdayThisYear)

    // Calcular dias até o aniversário
    const daysUntilBirthday = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Verificar se é hoje
    const isToday = daysUntilBirthday === 0

    // Gerar mensagem de aniversário
    const birthdayMessage = this.generateBirthdayMessage(ageWillTurn, daysUntilBirthday)

    return {
      id: apiMember.id.toString(),
      name: apiMember.name,
      email: apiMember.email,
      phone: apiMember.phone,
      photo: apiMember.photo,
      birthDate: apiMember.birthDate,
      ageWillTurn: ageWillTurn,
      birthdayThisYear: birthdayThisYear,
      daysUntilBirthday: daysUntilBirthday,
      isToday: isToday,
      birthdayMessage: birthdayMessage,
    }
  }

  // Função para calcular idade que fará no aniversário
  private static calculateAgeWillTurn(birthDateString: string, birthdayDate: Date): number {
    const birthDate = new Date(birthDateString)
    return birthdayDate.getFullYear() - birthDate.getFullYear()
  }

  // Função para gerar mensagem de aniversário
  private static generateBirthdayMessage(ageWillTurn: number, daysUntilBirthday: number): string {
    if (daysUntilBirthday === 0) {
      return `faz ${ageWillTurn} anos hoje! 🎉`
    } else if (daysUntilBirthday === 1) {
      return `fará ${ageWillTurn} anos amanhã`
    } else {
      return `fará ${ageWillTurn} anos daqui ${daysUntilBirthday} dias`
    }
  }

  // Função para calcular idade atual (mantida para compatibilidade)
  static calculateAge(birthDateString: string): number {
    const birthDate = new Date(birthDateString)
    const today = new Date()

    // Garantir que estamos trabalhando apenas com as datas, sem horário
    const birthYear = birthDate.getFullYear()
    const birthMonth = birthDate.getMonth()
    const birthDay = birthDate.getDate()

    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    const currentDay = today.getDate()

    let age = currentYear - birthYear

    // Se ainda não chegou o mês do aniversário, subtrai 1
    if (currentMonth < birthMonth) {
      age--
    }
    // Se estamos no mês do aniversário mas ainda não chegou o dia, subtrai 1
    else if (currentMonth === birthMonth && currentDay < birthDay) {
      age--
    }

    return age
  }

  // Função para formatar data de aniversário
  static formatBirthdayDate(date: Date): string {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    // Verificar se é hoje
    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    }

    // Verificar se é amanhã
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Amanhã"
    }

    // Formato padrão
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  // Função para obter estatísticas de aniversários
  static async getBirthdayStats(): Promise<{
    today: number
    thisWeek: number
    thisMonth: number
  }> {
    try {
      const [daily, weekly, monthly] = await Promise.all([
        this.getDailyBirthdays(),
        this.getWeeklyBirthdays(),
        this.getMonthlyBirthdays(),
      ])

      return {
        today: daily.length,
        thisWeek: weekly.length,
        thisMonth: monthly.length,
      }
    } catch (error) {
      console.error("Erro ao obter estatísticas de aniversários:", error)
      return {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      }
    }
  }
}
