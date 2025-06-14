"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  Clock,
  MapPin,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Calendar,
  Users,
  Repeat,
  List,
  Grid3X3,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { eventsService, type CalendarEventResponse, type EventResponse } from "@/services/events.service"
import { isAuthenticated, getUserRole } from "@/lib/auth-utils"

const DAYS_OF_WEEK = ["D", "S", "T", "Q", "Q", "S", "S"]
const DAYS_OF_WEEK_FULL = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
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

interface EventFormData {
  title: string
  description: string
  date: string
  time: string
  finishDate: string
  finishTime: string
  location: string
  eventType: string
  worshipTheme: string
  requiresParticipantList: boolean
  recurrence: string
}

export default function EventosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<CalendarEventResponse[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null)
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
    time: "09:00",
    finishDate: "",
    finishTime: "10:00",
    location: "",
    eventType: "0",
    worshipTheme: "",
    requiresParticipantList: false,
    recurrence: "once",
  })
  const [submitting, setSubmitting] = useState(false)

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

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setFormData({
      title: "",
      description: "",
      date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
      time: "09:00",
      finishDate: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
      finishTime: "10:00",
      location: "",
      eventType: "0",
      worshipTheme: "",
      requiresParticipantList: false,
      recurrence: "once",
    })
    setShowEventModal(true)
  }

  const handleEditEvent = async (eventId: number) => {
    try {
      const event = await eventsService.getEventById(eventId)
      setEditingEvent(event)
      setFormData(eventsService.formatEventFromAPI(event))
      setShowEventModal(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do evento",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return

    try {
      await eventsService.deleteEvent(eventId)
      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso",
      })
      loadEvents()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir evento",
        variant: "destructive",
      })
    }
  }

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const eventData = eventsService.formatEventForAPI(formData)

      if (editingEvent) {
        await eventsService.updateEvent(editingEvent.id, { ...eventData, id: editingEvent.id })
        toast({
          title: "Sucesso",
          description: "Evento atualizado com sucesso",
        })
      } else {
        await eventsService.createEvent(eventData)
        toast({
          title: "Sucesso",
          description: "Evento criado com sucesso",
        })
      }

      setShowEventModal(false)
      loadEvents()
    } catch (error) {
      toast({
        title: "Erro",
        description: editingEvent ? "Erro ao atualizar evento" : "Erro ao criar evento",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Gerar dias do mês para o calendário mobile
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

  // Obter todos os eventos do mês atual ordenados por data
  const getAllEventsThisMonth = () => {
    const monthEvents: Array<{ date: Date; event: CalendarEventResponse; occurrence: any }> = []

    events.forEach((event) => {
      event.occurrences.forEach((occurrence) => {
        const occurrenceDate = new Date(occurrence.start)
        if (
          occurrenceDate.getMonth() === currentDate.getMonth() &&
          occurrenceDate.getFullYear() === currentDate.getFullYear()
        ) {
          monthEvents.push({ date: occurrenceDate, event, occurrence })
        }
      })
    })

    return monthEvents.sort((a, b) => a.date.getTime() - b.date.getTime())
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-500">Carregando eventos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadEvents}>Tentar Novamente</Button>
        </div>
      </div>
    )
  }

  const calendarDays = generateCalendarDays()
  const monthEvents = getAllEventsThisMonth()

  return (
    <div className="flex-1 space-y-4 p-4">
      {/* Header Mobile */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Eventos</h1>
          {canManageEvents && (
            <Button onClick={handleCreateEvent} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[140px] text-center">
              {MONTHS[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        /* Calendar View Mobile */
        <Card>
          <CardContent className="p-2">
            {/* Calendar Grid Mobile */}
            <div className="grid grid-cols-7 gap-1">
              {/* Days of week header */}
              {DAYS_OF_WEEK.map((day, index) => (
                <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                  <span className="sm:hidden">{day}</span>
                  <span className="hidden sm:inline">{DAYS_OF_WEEK_FULL[index]}</span>
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
                      min-h-[60px] sm:min-h-[80px] p-1 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
                      ${!isCurrentMonthDay ? "text-gray-300 bg-gray-50" : ""}
                      ${isTodayDate ? "bg-blue-50 border-blue-200" : ""}
                      ${selectedDate?.toDateString() === date.toDateString() ? "ring-2 ring-blue-500" : ""}
                    `}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className={`text-xs font-medium mb-1 ${isTodayDate ? "text-blue-600" : ""}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 1).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="text-[10px] sm:text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                          title={event.title}
                        >
                          <div className="flex items-center gap-1">
                            {event.isRecurring && <Repeat className="h-2 w-2 sm:h-3 sm:w-3" />}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 1 && (
                        <div className="text-[10px] text-gray-500 font-medium">+{dayEvents.length - 1}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View Mobile */
        <div className="space-y-3">
          {monthEvents.length > 0 ? (
            monthEvents.map(({ date, event, occurrence }, index) => (
              <Card key={`${event.id}-${index}`} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {formatFullDate(date)}
                        </div>
                        {event.isRecurring && (
                          <Badge variant="outline" className="text-xs">
                            <Repeat className="h-3 w-3 mr-1" />
                            Recorrente
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-medium text-lg mb-1 truncate">{event.title}</h3>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(occurrence.start)} - {formatTime(occurrence.end)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.description && expandedEvent === event.id && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}

                      {event.description && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                          className="p-0 h-auto text-blue-600"
                        >
                          {expandedEvent === event.id ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Menos detalhes
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Mais detalhes
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {canManageEvents && (
                      <div className="flex flex-col gap-2 ml-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditEvent(event.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum evento este mês</p>
                {canManageEvents && (
                  <Button onClick={handleCreateEvent} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Evento
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Selected Date Events Mobile */}
      {selectedDate && viewMode === "calendar" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{event.title}</h3>
                        {event.isRecurring && (
                          <Badge variant="outline" className="text-xs">
                            <Repeat className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        {event.occurrences[0] && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(event.occurrences[0].start)} - {formatTime(event.occurrences[0].end)}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {canManageEvents && (
                      <div className="flex gap-1 ml-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditEvent(event.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">Nenhum evento nesta data</p>
                {canManageEvents && (
                  <Button onClick={handleCreateEvent} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Evento
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Modal Mobile */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEvent} className="space-y-4">
            {/* Informações Básicas */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="title" className="text-sm">
                  Título *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nome do evento"
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="eventType" className="text-sm">
                    Tipo
                  </Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventsService.getEventTypeOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm">
                    Local
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Local"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do evento"
                  rows={2}
                  className="mt-1"
                />
              </div>

              {formData.eventType === "0" && (
                <div>
                  <Label htmlFor="worshipTheme" className="text-sm">
                    Tema do Culto
                  </Label>
                  <Input
                    id="worshipTheme"
                    value={formData.worshipTheme}
                    onChange={(e) => setFormData({ ...formData, worshipTheme: e.target.value })}
                    placeholder="Tema do culto"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Data e Hora */}
            <div className="space-y-3">
              <h3 className="font-medium">Data e Hora</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date" className="text-sm">
                    Data *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="time" className="text-sm">
                    Hora *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="finishDate" className="text-sm">
                    Fim
                  </Label>
                  <Input
                    id="finishDate"
                    type="date"
                    value={formData.finishDate}
                    onChange={(e) => setFormData({ ...formData, finishDate: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="finishTime" className="text-sm">
                    Hora Fim
                  </Label>
                  <Input
                    id="finishTime"
                    type="time"
                    value={formData.finishTime}
                    onChange={(e) => setFormData({ ...formData, finishTime: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Recorrência */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="recurrence" className="text-sm">
                  Repetir
                </Label>
                <Select
                  value={formData.recurrence}
                  onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Não repetir</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                    <SelectItem value="biweekly">A cada 2 semanas</SelectItem>
                    <SelectItem value="monthly">Mensalmente</SelectItem>
                    <SelectItem value="yearly">Anualmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Opções */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresParticipantList"
                  checked={formData.requiresParticipantList}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresParticipantList: !!checked })}
                />
                <Label htmlFor="requiresParticipantList" className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Lista de participantes
                </Label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEventModal(false)}
                disabled={submitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingEvent ? "Salvando..." : "Criando..."}
                  </>
                ) : editingEvent ? (
                  "Salvar"
                ) : (
                  "Criar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
