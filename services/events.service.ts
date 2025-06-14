import { authFetch } from "@/lib/auth-fetch"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api"

export interface EventRequest {
  title: string
  description: string
  date: string // ISO string
  finishDate: string // ISO string
  location: string
  requiresParticipantList: boolean
  recurrenceType: number
  frequency: number
  eventType: number
  worshipTheme?: string
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

// Enums para tipos
export enum EventType {
  Culto = 0,
  Reuniao = 1,
  Evento = 2,
  Conferencia = 3,
  Retiro = 4,
  Casamento = 5,
  Funeral = 6,
  Batismo = 7,
  Outro = 8,
}

export enum RecurrenceType {
  None = 0,
  Weekly = 1,
  Monthly = 2,
  Yearly = 3,
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
        const errorText = await response.text()
        throw new Error(`Erro ao criar evento: ${response.status} - ${errorText}`)
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
        const errorText = await response.text()
        throw new Error(`Erro ao buscar evento: ${response.status} - ${errorText}`)
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
        const errorText = await response.text()
        throw new Error(`Erro ao atualizar evento: ${response.status} - ${errorText}`)
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
        const errorText = await response.text()
        throw new Error(`Erro ao deletar evento: ${response.status} - ${errorText}`)
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
        const errorText = await response.text()
        throw new Error(`Erro ao buscar eventos do calendário: ${response.status} - ${errorText}`)
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
      eventType: Number(formData.eventType) || 0,
      worshipTheme: formData.worshipTheme || "",
    }
  }

  /**
   * Converte tipo de recorrência do formulário para número da API
   */
  private getRecurrenceType(recurrence: string): number {
    switch (recurrence) {
      case "once":
        return RecurrenceType.None
      case "weekly":
        return RecurrenceType.Weekly
      case "biweekly":
        return RecurrenceType.Weekly
      case "monthly":
        return RecurrenceType.Monthly
      case "yearly":
        return RecurrenceType.Yearly
      default:
        return RecurrenceType.None
    }
  }

  /**
   * Converte frequência do formulário para número da API
   */
  private getFrequency(recurrence: string): number {
    switch (recurrence) {
      case "weekly":
        return 1
      case "biweekly":
        return 2
      case "monthly":
        return 1
      case "yearly":
        return 1
      default:
        return 0
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
      eventType: 0, // Será implementado quando a API retornar
      worshipTheme: "", // Será implementado quando a API retornar
    }
  }

  /**
   * Converte tipo de recorrência da API para string do formulário
   */
  private getRecurrenceString(recurrenceType?: number, frequency?: number): string {
    if (!recurrenceType || recurrenceType === RecurrenceType.None) return "once"

    switch (recurrenceType) {
      case RecurrenceType.Weekly:
        return frequency === 2 ? "biweekly" : "weekly"
      case RecurrenceType.Monthly:
        return "monthly"
      case RecurrenceType.Yearly:
        return "yearly"
      default:
        return "once"
    }
  }

  /**
   * Obtém o nome do tipo de evento
   */
  getEventTypeName(eventType: number): string {
    switch (eventType) {
      case EventType.Culto:
        return "Culto"
      case EventType.Reuniao:
        return "Reunião"
      case EventType.Evento:
        return "Evento"
      case EventType.Conferencia:
        return "Conferência"
      case EventType.Retiro:
        return "Retiro"
      case EventType.Casamento:
        return "Casamento"
      case EventType.Funeral:
        return "Funeral"
      case EventType.Batismo:
        return "Batismo"
      case EventType.Outro:
        return "Outro"
      default:
        return "Evento"
    }
  }

  /**
   * Obtém todas as opções de tipo de evento
   */
  getEventTypeOptions() {
    return [
      { value: EventType.Culto, label: "Culto" },
      { value: EventType.Reuniao, label: "Reunião" },
      { value: EventType.Evento, label: "Evento" },
      { value: EventType.Conferencia, label: "Conferência" },
      { value: EventType.Retiro, label: "Retiro" },
      { value: EventType.Casamento, label: "Casamento" },
      { value: EventType.Funeral, label: "Funeral" },
      { value: EventType.Batismo, label: "Batismo" },
      { value: EventType.Outro, label: "Outro" },
    ]
  }
}

export const eventsService = new EventsService()
