"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Clock, MapPin, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { eventsService, type CalendarEventResponse } from "@/services/events.service"
import { isAuthenticated, getUserRole } from "@/lib/auth-utils"

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export default function EventosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<CalendarEventResponse[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")

  const userRole = getUserRole()
  const canManageEvents = userRole === "Admin" || userRole === "Pastor"

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    loadEvents()
  }, [router, currentDate])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      const eventsData = await eventsService.getCalendarEvents(year, month)
      setEvents(eventsData)
    } catch (error) {
      console.error("Erro ao carregar eventos:", error)
      setError("Erro ao carregar eventos. Verifique sua conexão.")
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  // Gerar dias do mês para o calendário
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    // Gerar 42 dias (6 semanas)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  // Obter eventos para uma data específica
  const getEventsForDate = (date: Date) => {
    return events.filter((event) =>
      event.occurrences.some((occurrence) => {
        const occurrenceDate = new Date(occurrence.start)
        return (
          occurrenceDate.getDate() === date.getDate() &&
          occurrenceDate.getMonth() === date.getMonth() &&
          occurrenceDate.getFullYear() === date.getFullYear()
        )
      }),
    )
  }

  // Navegar entre meses
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // Verificar se é hoje
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Verificar se é do mês atual
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-500">Carregando eventos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadEvents}>Tentar Novamente</Button>
        </div>
      </div>
    )
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda de Eventos</h1>
          <p className="text-muted-foreground">Gerencie os eventos da sua igreja</p>
        </div>
        {canManageEvents && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        )}
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("month")}
              >
                Mês
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
              >
                Semana
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Days of week header */}
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDate(date)
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)

              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-1 border border-gray-100 cursor-pointer hover:bg-gray-50
                    ${!isCurrentMonthDay ? "text-gray-300 bg-gray-50" : ""}
                    ${isTodayDate ? "bg-blue-50 border-blue-200" : ""}
                    ${selectedDate?.toDateString() === date.toDateString() ? "ring-2 ring-blue-500" : ""}
                  `}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className={`text-sm font-medium mb-1 ${isTodayDate ? "text-blue-600" : ""}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <div className="text-xs text-gray-500">+{dayEvents.length - 3} mais</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Eventos de{" "}
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-4">
                {getEventsForDate(selectedDate).map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{event.title}</h3>
                      {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {event.occurrences[0] && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(event.occurrences[0].start)} - {formatTime(event.occurrences[0].end)}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    {event.isRecurring && <Badge variant="outline">Recorrente</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum evento nesta data.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
