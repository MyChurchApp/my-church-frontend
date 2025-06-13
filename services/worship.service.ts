import { authFetch } from "@/lib/auth-fetch"

export interface BibleReference {
  id: number
  bibleVersionId: number
  bookId: number
  chapterId: number
  verseStart: number
  verseEnd: number
}

export interface Hymn {
  id: number
  hymnId: number
  hymnTitle: string
  hymnNumber: string
}

export interface Activity {
  id: number
  name: string
  content: string
  order: number
  isCurrent: boolean
  bibles: BibleReference[]
  hymns: Hymn[]
}

export interface ScheduleItem {
  id: number
  worshipServiceId: number
  name: string
  order: number
}

export interface WorshipService {
  id: number
  churchId: number
  eventId: number
  title: string
  theme: string
  startTime: string
  endTime: string
  description: string
  status: number
  activities: Activity[]
  schedule: ScheduleItem[]
  presencesCount: number
}

export enum WorshipStatus {
  NotStarted = 0,
  InProgress = 1,
  Finished = 2,
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br"

export const worshipService = {
  /**
   * Obtém cultos por status
   * @param status 0=não iniciados, 1=iniciados, 2=finalizados
   */
  async getWorshipByStatus(status: WorshipStatus): Promise<WorshipService[]> {
    console.log(`🔍 Buscando cultos com status: ${status}`)

    try {
      const response = await authFetch(`${API_URL}/api/Event/worship/${status}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar cultos: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`✅ Cultos obtidos com sucesso. Total: ${Array.isArray(data) ? data.length : 0}`)
      return Array.isArray(data) ? data : [data]
    } catch (error) {
      console.error("❌ Erro ao buscar cultos:", error)
      throw error
    }
  },

  /**
   * Obtém detalhes de um culto específico
   * @param id ID do culto
   */
  async getWorshipDetails(id: number): Promise<WorshipService> {
    console.log(`🔍 Buscando detalhes do culto ID: ${id}`)

    try {
      const response = await authFetch(`${API_URL}/api/Event/worship/details/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar detalhes do culto: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`✅ Detalhes do culto obtidos com sucesso.`)
      return data
    } catch (error) {
      console.error("❌ Erro ao buscar detalhes do culto:", error)
      throw error
    }
  },

  /**
   * Inicia um culto
   * @param id ID do culto
   */
  async startWorship(id: number): Promise<boolean> {
    console.log(`▶️ Iniciando culto ID: ${id}`)

    try {
      const response = await authFetch(`${API_URL}/api/Event/worship/start/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao iniciar culto: ${response.status} ${response.statusText}`)
      }

      console.log(`✅ Culto iniciado com sucesso.`)
      return true
    } catch (error) {
      console.error("❌ Erro ao iniciar culto:", error)
      throw error
    }
  },

  /**
   * Finaliza um culto
   * @param id ID do culto
   */
  async finishWorship(id: number): Promise<boolean> {
    console.log(`⏹️ Finalizando culto ID: ${id}`)

    try {
      const response = await authFetch(`${API_URL}/api/Event/worship/finish/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao finalizar culto: ${response.status} ${response.statusText}`)
      }

      console.log(`✅ Culto finalizado com sucesso.`)
      return true
    } catch (error) {
      console.error("❌ Erro ao finalizar culto:", error)
      throw error
    }
  },
}
