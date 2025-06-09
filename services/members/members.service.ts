import { authFetch } from "@/lib/auth-fetch"
import type { ApiMember } from "@/lib/api"

// Enum para tipos de filtro de aniversário
export enum BirthdayFilterType {
  Day = 0,
  Week = 1,
  Month = 2,
}

// Interface para resposta de aniversariantes
export interface BirthdayMember extends ApiMember {
  age?: number
  daysUntilBirthday?: number
  birthdayThisYear?: Date
}

// Classe de serviço para membros
export class MembersService {
  private static baseUrl = "https://demoapp.top1soft.com.br/api/Member"

  /**
   * Busca membros aniversariantes
   * @param filterType - Tipo de filtro (Day=0, Week=1, Month=2)
   * @returns Lista de membros aniversariantes
   */
  static async getBirthdayMembers(filterType: BirthdayFilterType = BirthdayFilterType.Week): Promise<BirthdayMember[]> {
    try {
      const url = `${this.baseUrl}/birthdays?filterType=${filterType}`
      console.log("Buscando aniversariantes:", url)

      const response = await authFetch(url)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.")
        }
        throw new Error(`Erro ao buscar aniversariantes: ${response.status}`)
      }

      const members: ApiMember[] = await response.json()
      console.log("Aniversariantes encontrados:", members)

      // Processar dados para adicionar informações extras
      return this.processBirthdayMembers(members)
    } catch (error) {
      console.error("Erro ao buscar aniversariantes:", error)
      throw error
    }
  }

  /**
   * Busca aniversariantes da semana
   */
  static async getWeeklyBirthdays(): Promise<BirthdayMember[]> {
    return this.getBirthdayMembers(BirthdayFilterType.Week)
  }

  /**
   * Busca aniversariantes do dia
   */
  static async getTodayBirthdays(): Promise<BirthdayMember[]> {
    return this.getBirthdayMembers(BirthdayFilterType.Day)
  }

  /**
   * Busca aniversariantes do mês
   */
  static async getMonthlyBirthdays(): Promise<BirthdayMember[]> {
    return this.getBirthdayMembers(BirthdayFilterType.Month)
  }

  /**
   * Processa membros para adicionar informações de aniversário
   */
  private static processBirthdayMembers(members: ApiMember[]): BirthdayMember[] {
    const today = new Date()
    const currentYear = today.getFullYear()

    return members.map((member) => {
      const birthDate = new Date(member.birthDate)
      const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate())

      // Se o aniversário já passou este ano, considerar o próximo ano
      if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(currentYear + 1)
      }

      // Calcular idade
      const age = currentYear - birthDate.getFullYear()

      // Calcular dias até o aniversário
      const timeDiff = birthdayThisYear.getTime() - today.getTime()
      const daysUntilBirthday = Math.ceil(timeDiff / (1000 * 3600 * 24))

      return {
        ...member,
        age,
        daysUntilBirthday,
        birthdayThisYear,
      }
    })
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
   * Calcula a idade baseada na data de nascimento
   */
  static calculateAge(birthDate: string): number {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  /**
   * Verifica se hoje é aniversário do membro
   */
  static isBirthdayToday(birthDate: string): boolean {
    const birth = new Date(birthDate)
    const today = new Date()

    return birth.getMonth() === today.getMonth() && birth.getDate() === today.getDate()
  }

  /**
   * Verifica se o aniversário é esta semana
   */
  static isBirthdayThisWeek(birthDate: string): boolean {
    const birth = new Date(birthDate)
    const today = new Date()
    const currentYear = today.getFullYear()

    // Criar data do aniversário neste ano
    const birthdayThisYear = new Date(currentYear, birth.getMonth(), birth.getDate())

    // Se já passou, considerar o próximo ano
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(currentYear + 1)
    }

    // Calcular início e fim da semana
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return birthdayThisYear >= startOfWeek && birthdayThisYear <= endOfWeek
  }
}

// Exportar tipos e enums
export type { BirthdayMember }
