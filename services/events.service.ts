import { authFetch } from "@/lib/auth-fetch"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br"

export interface EventRequest {
  title: string
  description: string
  date: string // ISO string
  finishDate: string // ISO string
  location: string
  requiresParticipantList: boolean
  recurrenceType: number
  frequency: number
}

export interface EventUpdateRequest extends EventRequest {
  id: number
}

export interface EventResponse {
  id: number
  title: string
  description: string
  date: string
  finishDate: string
  location: string
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
    members: any[]
    subscription: any
  }
  requiresParticipantList: boolean
  participants: any[]
  recurrence: {
    id: number
    eventId: number
    recurrenceType: number
    frequency: number
    recurrenceEndDate: string
  }
  notifications: any[]
}

export interface CalendarEventResponse {
  id: number
  title: string
  description: string
  location: string
  churchId: number
  isRecurring: boolean
  recurrenceType: number
  frequency: number
  occurrences: {
    start: string
    end: string
  }[]
}

class EventsService {
  /**
   * Cria um novo evento
   */
  async createEvent(eventData: EventRequest): Promise<number> {
    try {
      const response = await authFetch(`${API_BASE_URL}/Event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error(`Erro ao criar evento: ${response.status}`)
      }

      const eventId = await response.text()
      return Number.parseInt(eventId)
    } catch (error) {
      console.error("Erro ao criar evento:", error)
      throw error
    }
  }

  /**
   * Busca um evento por ID
   */
  async getEventById(id: number): Promise<EventResponse> {
    try {
      const response = await authFetch(`${API_BASE_URL}/Event/${id}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar evento: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar evento:", error)
      throw error
    }
  }

  /**
   * Atualiza um evento existente
   */
  async updateEvent(id: number, eventData: EventUpdateRequest): Promise<EventResponse> {
    try {
      const response = await authFetch(`${API_BASE_URL}/Event/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar evento: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao atualizar evento:", error)
      throw error
    }
  }

  /**
   * Deleta um evento
   */
  async deleteEvent(id: number): Promise<void> {
    try {
      const response = await authFetch(`${API_BASE_URL}/Event/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Erro ao deletar evento: ${response.status}`)
      }
    } catch (error) {
      console.error("Erro ao deletar evento:", error)
      throw error
    }
  }

  /**
   * Lista eventos para o calendário do mês/ano informado (inclui recorrentes)
   */
  async getCalendarEvents(year?: number, month?: number): Promise<CalendarEventResponse[]> {
    try {
      const params = new URLSearchParams()
      if (year) params.append("Year", year.toString())
      if (month) params.append("Month", month.toString())

      const url = `${API_BASE_URL}/Event/calendar${params.toString() ? `?${params.toString()}` : ""}`

      const response = await authFetch(url, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar eventos do calendário: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar eventos do calendário:", error)
      throw error
    }
  }

  /**
   * Converte dados do formulário para o formato da API
   */
  formatEventForAPI(formData: any): EventRequest {
    return {
      title: formData.title,
      description: formData.description || "",
      date: new Date(formData.date + "T" + formData.time).toISOString(),
      finishDate: formData.finishDate
        ? new Date(formData.finishDate + "T" + (formData.finishTime || formData.time)).toISOString()
        : new Date(formData.date + "T" + formData.time).toISOString(),
      location: formData.location || "",
      requiresParticipantList: formData.requiresParticipantList || false,
      recurrenceType: this.getRecurrenceType(formData.recurrence),
      frequency: this.getFrequency(formData.recurrence),
    }
  }

  /**
   * Converte tipo de recorrência do formulário para número da API
   */
  private getRecurrenceType(recurrence: string): number {
    switch (recurrence) {
      case "once":
        return 0 // Sem recorrência
      case "weekly":
        return 1 // Semanal
      case "biweekly":
        return 1 // Semanal (com frequência 2)
      case "monthly":
        return 2 // Mensal
      case "yearly":
        return 3 // Anual
      default:
        return 0
    }
  }

  /**
   * Converte frequência do formulário para número da API
   */
  private getFrequency(recurrence: string): number {
    switch (recurrence) {
      case "weekly":
        return 1 // A cada 1 semana
      case "biweekly":
        return 2 // A cada 2 semanas
      case "monthly":
        return 1 // A cada 1 mês
      case "yearly":
        return 1 // A cada 1 ano
      default:
        return 0 // Sem frequência
    }
  }

  /**
   * Converte evento da API para formato do formulário
   */
  formatEventFromAPI(apiEvent: EventResponse): any {
    const eventDate = new Date(apiEvent.date)
    const finishDate = new Date(apiEvent.finishDate)

    return {
      id: apiEvent.id,
      title: apiEvent.title,
      description: apiEvent.description,
      date: eventDate.toISOString().split("T")[0],
      time: eventDate.toTimeString().slice(0, 5),
      finishDate: finishDate.toISOString().split("T")[0],
      finishTime: finishDate.toTimeString().slice(0, 5),
      location: apiEvent.location,
      requiresParticipantList: apiEvent.requiresParticipantList,
      recurrence: this.getRecurrenceString(apiEvent.recurrence?.recurrenceType, apiEvent.recurrence?.frequency),
    }
  }

  /**
   * Converte tipo de recorrência da API para string do formulário
   */
  private getRecurrenceString(recurrenceType?: number, frequency?: number): string {
    if (!recurrenceType || recurrenceType === 0) return "once"

    switch (recurrenceType) {
      case 1: // Semanal
        return frequency === 2 ? "biweekly" : "weekly"
      case 2: // Mensal
        return "monthly"
      case 3: // Anual
        return "yearly"
      default:
        return "once"
    }
  }
}

export const eventsService = new EventsService()
