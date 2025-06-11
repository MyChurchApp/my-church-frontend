"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Filter,
  Edit,
  Trash2,
  Palette,
  Loader2,
  Info,
  X,
  Search,
  MoreVertical,
  ArrowUpDown,
} from "lucide-react"
import { getUser, type User } from "@/lib/fake-api"
import { eventsService, type CalendarEventResponse } from "@/services/events.service"

// Cores disponíveis para eventos
const eventColors = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Laranja", value: "#f59e0b" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
]

// Tipos de eventos
const eventTypes = [
  { label: "Todos", value: "all" },
  { label: "Cultos", value: "culto" },
  { label: "Eventos", value: "evento" },
  { label: "Reuniões", value: "reuniao" },
  { label: "Estudos", value: "estudo" },
]

function getDaysInMonth(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const days: (Date | null)[] = Array(firstDayOfMonth).fill(null)

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  return days
}

function formatDateToDisplay(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatTimeToDisplay(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function EventosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<CalendarEventResponse[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [sortBy, setSortBy] = useState<"date" | "title">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Form state for new/edit event
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventResponse | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    finishDate: "",
    finishTime: "",
    location: "",
    requiresParticipantList: false,
    recurrence: "once",
    type: "evento",
    color: "#3b82f6",
  })

  // Refs para os modais
  const createDialogRef = useRef<HTMLButtonElement>(null)
  const editDialogRef = useRef<HTMLButtonElement>(null)
  const viewDialogRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const userData = getUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
    loadEvents()
  }, [router, currentDate])

  const loadEvents = async () => {
    try {
      setLoadingEvents(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const eventsData = await eventsService.getCalendarEvents(year, month)
      setEvents(eventsData)
    } catch (error) {
      console.error("Erro ao carregar eventos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoadingEvents(false)
    }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      return event.occurrences.some((occurrence) => {
        const occurrenceDate = new Date(occurrence.start)
        return (
          occurrenceDate.getDate() === date.getDate() &&
          occurrenceDate.getMonth() === date.getMonth() &&
          occurrenceDate.getFullYear() === date.getFullYear()
        )
      })
    })
  }

  const getEventTypeColor = (type: string, isRecurring: boolean) => {
    if (isRecurring) {
      return "bg-purple-100 text-purple-800 border-purple-200"
    }

    switch (type) {
      case "culto":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "evento":
        return "bg-green-100 text-green-800 border-green-200"
      case "reuniao":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "estudo":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getEventBorderColor = (type: string) => {
    switch (type) {
      case "culto":
        return "border-blue-500"
      case "evento":
        return "border-green-500"
      case "reuniao":
        return "border-amber-500"
      case "estudo":
        return "border-indigo-500"
      default:
        return "border-gray-300"
    }
  }

  const resetEventForm = () => {
    // Definir data padrão como hoje
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    const formattedTime = "18:00"

    setNewEvent({
      title: "",
      description: "",
      date: formattedDate,
      time: formattedTime,
      finishDate: "",
      finishTime: "",
      location: "",
      requiresParticipantList: false,
      recurrence: "once",
      type: "evento",
      color: "#3b82f6",
    })
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const eventData = eventsService.formatEventForAPI({
        ...newEvent,
        description: `[${newEvent.type}] ${newEvent.description}`,
      })
      await eventsService.createEvent(eventData)

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!",
      })

      resetEventForm()
      setIsCreateDialogOpen(false)
      await loadEvents()
    } catch (error) {
      console.error("Erro ao criar evento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent || !newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const eventData = {
        ...eventsService.formatEventForAPI({
          ...newEvent,
          description: `[${newEvent.type}] ${newEvent.description}`,
        }),
        id: selectedEvent.id,
      }
      await eventsService.updateEvent(selectedEvent.id, eventData)

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!",
      })

      resetEventForm()
      setSelectedEvent(null)
      setIsEditDialogOpen(false)
      await loadEvents()
    } catch (error) {
      console.error("Erro ao atualizar evento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o evento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) {
      return
    }

    try {
      setLoading(true)
      await eventsService.deleteEvent(eventId)

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso!",
      })

      setIsEditDialogOpen(false)
      setIsViewDialogOpen(false)
      setSelectedEvent(null)
      await loadEvents()
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (event: CalendarEventResponse) => {
    setSelectedEvent(event)

    // Extrair tipo do evento da descrição
    let eventType = "evento"
    let description = event.description

    const typeMatch = event.description.match(/^\[(culto|evento|reuniao|estudo)\]\s*(.*)$/i)
    if (typeMatch) {
      eventType = typeMatch[1].toLowerCase()
      description = typeMatch[2]
    }

    // Para edição, vamos usar os dados básicos do evento
    const firstOccurrence = event.occurrences[0]
    const startDate = new Date(firstOccurrence.start)
    const endDate = new Date(firstOccurrence.end)

    setNewEvent({
      title: event.title,
      description: description,
      date: startDate.toISOString().split("T")[0],
      time: startDate.toTimeString().slice(0, 5),
      finishDate: endDate.toISOString().split("T")[0],
      finishTime: endDate.toTimeString().slice(0, 5),
      location: event.location,
      requiresParticipantList: false,
      recurrence: event.isRecurring ? "weekly" : "once",
      type: eventType,
      color: "#3b82f6",
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (event: CalendarEventResponse) => {
    setSelectedEvent(event)
    setIsViewDialogOpen(true)
  }

  const handleCreateNewClick = () => {
    resetEventForm()
    setIsCreateDialogOpen(true)
  }

  const filteredEvents = events
    .filter((event) => {
      // Filtrar por tipo
      if (filterType !== "all") {
        const typeMatch = event.description.match(/^\[(culto|evento|reuniao|estudo)\]/i)
        if (typeMatch && typeMatch[1].toLowerCase() !== filterType) {
          return false
        }
      }

      // Filtrar por pesquisa
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
        )
      }

      return true
    })
    .sort((a, b) => {
      // Ordenar eventos
      if (sortBy === "date") {
        const dateA = new Date(a.occurrences[0]?.start || 0).getTime()
        const dateB = new Date(b.occurrences[0]?.start || 0).getTime()
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else {
        return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      }
    })

  const monthNames = [
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

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  // Extrair tipo do evento da descrição
  const getEventType = (description: string) => {
    const typeMatch = description.match(/^\[(culto|evento|reuniao|estudo)\]/i)
    return typeMatch ? typeMatch[1].toLowerCase() : "evento"
  }

  // Extrair descrição limpa (sem o tipo)
  const getCleanDescription = (description: string) => {
    const typeMatch = description.match(/^\[(culto|evento|reuniao|estudo)\]\s*(.*)$/i)
    return typeMatch ? typeMatch[2] : description
  }

  const toggleSort = (field: "date" | "title") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Eventos</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 hidden sm:block">
                Gerencie os eventos da igreja
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar eventos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 sm:h-9 text-sm w-full sm:w-[200px] md:w-[250px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="px-2 sm:px-3 h-8 sm:h-9"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden md:inline ml-1">Calendário</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-2 sm:px-3 h-8 sm:h-9"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden md:inline ml-1">Lista</span>
                </Button>
              </div>

              {user.accessLevel === "admin" && (
                <Button
                  onClick={handleCreateNewClick}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 md:px-4 h-8 sm:h-9"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Evento</span>
                </Button>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-500">Filtrar:</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {eventTypes.map((type) => (
                <Badge
                  key={type.value}
                  variant={filterType === type.value ? "default" : "outline"}
                  className="cursor-pointer text-xs h-6"
                  onClick={() => setFilterType(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>
        </header>

        {/* Create Event Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger ref={createDialogRef} className="hidden" />
          <DialogContent className="w-[95vw] max-w-md max-h-[95vh] overflow-y-auto mx-2 sm:mx-4">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg md:text-xl">Criar Novo Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title" className="text-sm">
                  Título *
                </Label>
                <Input
                  id="event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Nome do evento"
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-type" className="text-sm">
                  Tipo de Evento
                </Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="culto">Culto</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="estudo">Estudo Bíblico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date" className="text-sm">
                    Data *
                  </Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time" className="text-sm">
                    Horário *
                  </Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-finish-date" className="text-sm">
                    Data Final
                  </Label>
                  <Input
                    id="event-finish-date"
                    type="date"
                    value={newEvent.finishDate}
                    onChange={(e) => setNewEvent({ ...newEvent, finishDate: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-finish-time" className="text-sm">
                    Horário Final
                  </Label>
                  <Input
                    id="event-finish-time"
                    type="time"
                    value={newEvent.finishTime}
                    onChange={(e) => setNewEvent({ ...newEvent, finishTime: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-location" className="text-sm">
                  Local
                </Label>
                <Input
                  id="event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Local do evento"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description" className="text-sm">
                  Descrição
                </Label>
                <Textarea
                  id="event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Descrição do evento"
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-recurrence" className="text-sm">
                  Recorrência
                </Label>
                <Select
                  value={newEvent.recurrence}
                  onValueChange={(value) => setNewEvent({ ...newEvent, recurrence: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione a recorrência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Apenas uma vez</SelectItem>
                    <SelectItem value="weekly">Toda semana</SelectItem>
                    <SelectItem value="biweekly">A cada duas semanas</SelectItem>
                    <SelectItem value="monthly">Todo mês</SelectItem>
                    <SelectItem value="yearly">Todo ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="event-participants"
                    checked={newEvent.requiresParticipantList}
                    onCheckedChange={(checked) =>
                      setNewEvent({ ...newEvent, requiresParticipantList: checked === true })
                    }
                  />
                  <Label htmlFor="event-participants" className="text-sm">
                    Requer lista de participantes
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                  Cor do Evento
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {eventColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all ${
                        newEvent.color === color.value
                          ? "border-gray-800 scale-110"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 text-sm" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Evento"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger ref={editDialogRef} className="hidden" />
          <DialogContent className="w-[95vw] max-w-md max-h-[95vh] overflow-y-auto mx-2 sm:mx-4">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg md:text-xl">Editar Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditEvent} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-event-title" className="text-sm">
                  Título *
                </Label>
                <Input
                  id="edit-event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Nome do evento"
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-type" className="text-sm">
                  Tipo de Evento
                </Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="culto">Culto</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="estudo">Estudo Bíblico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-date" className="text-sm">
                    Data *
                  </Label>
                  <Input
                    id="edit-event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-event-time" className="text-sm">
                    Horário *
                  </Label>
                  <Input
                    id="edit-event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-location" className="text-sm">
                  Local
                </Label>
                <Input
                  id="edit-event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Local do evento"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-description" className="text-sm">
                  Descrição
                </Label>
                <Textarea
                  id="edit-event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Descrição do evento"
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 text-sm" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
                  className="flex items-center gap-2 text-sm"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Event Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogTrigger ref={viewDialogRef} className="hidden" />
          <DialogContent className="w-[95vw] max-w-md max-h-[95vh] overflow-y-auto mx-2 sm:mx-4">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-base sm:text-lg md:text-xl">{selectedEvent.title}</DialogTitle>
                    <div className="flex items-center gap-2">
                      {user?.accessLevel === "admin" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsViewDialogOpen(false)
                              setTimeout(() => openEditDialog(selectedEvent), 100)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(selectedEvent.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getEventTypeColor(getEventType(selectedEvent.description), selectedEvent.isRecurring)}
                    >
                      {getEventType(selectedEvent.description).charAt(0).toUpperCase() +
                        getEventType(selectedEvent.description).slice(1)}
                    </Badge>
                    {selectedEvent.isRecurring && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        <span>Recorrente</span>
                      </Badge>
                    )}
                  </div>

                  {selectedEvent.occurrences.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{formatDateToDisplay(selectedEvent.occurrences[0].start)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {formatTimeToDisplay(selectedEvent.occurrences[0].start)} -
                          {formatTimeToDisplay(selectedEvent.occurrences[0].end)}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200">
                    <h4 className="text-sm font-medium mb-2">Descrição</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {getCleanDescription(selectedEvent.description) || "Sem descrição"}
                    </p>
                  </div>

                  {selectedEvent.isRecurring && (
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="text-sm font-medium mb-2">Próximas ocorrências</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedEvent.occurrences.slice(0, 5).map((occurrence, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span>
                              {new Date(occurrence.start).toLocaleDateString("pt-BR")} -
                              {new Date(occurrence.start).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))}
                        {selectedEvent.occurrences.length > 5 && (
                          <div className="text-xs text-gray-500 italic">
                            + {selectedEvent.occurrences.length - 5} mais ocorrências
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6">
            {loadingEvents ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : viewMode === "calendar" ? (
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden xs:inline">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </span>
                      <span className="xs:hidden text-sm">
                        {monthNames[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                        className="px-1 sm:px-2 md:px-3 h-7 sm:h-8 md:h-9"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                        className="px-1 sm:px-2 md:px-3 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      >
                        Hoje
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                        className="px-1 sm:px-2 md:px-3 h-7 sm:h-8 md:h-9"
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-1 sm:p-2 md:p-6">
                  <div className="grid grid-cols-7 gap-1 mb-2 md:mb-4">
                    {weekDays.map((day) => (
                      <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-gray-500">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 1)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentDate).map((day, index) => {
                      // Verificar se é o dia atual
                      const isToday =
                        day &&
                        day.getDate() === new Date().getDate() &&
                        day.getMonth() === new Date().getMonth() &&
                        day.getFullYear() === new Date().getFullYear()

                      return (
                        <div
                          key={index}
                          className={`min-h-12 sm:min-h-16 md:min-h-24 p-1 border ${
                            isToday
                              ? "border-blue-400 bg-blue-50"
                              : day
                                ? "border-gray-100 bg-white hover:bg-gray-50"
                                : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          {day && (
                            <>
                              <div
                                className={`text-xs md:text-sm font-medium mb-1 ${
                                  isToday ? "text-blue-600" : "text-gray-700"
                                }`}
                              >
                                {day.getDate()}
                              </div>
                              <div className="space-y-1">
                                {getEventsForDate(day)
                                  .filter((event) => {
                                    if (filterType === "all") return true
                                    const eventType = getEventType(event.description)
                                    return eventType === filterType
                                  })
                                  .slice(0, window.innerWidth < 640 ? 1 : 2)
                                  .map((event) => (
                                    <div
                                      key={event.id}
                                      className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 ${getEventTypeColor(
                                        getEventType(event.description),
                                        event.isRecurring,
                                      )}`}
                                      onClick={() => openViewDialog(event)}
                                    >
                                      <div className="font-medium truncate text-xs">{event.title}</div>
                                      {event.isRecurring && <span className="text-xs">🔄</span>}
                                    </div>
                                  ))}
                                {getEventsForDate(day).filter((event) => {
                                  if (filterType === "all") return true
                                  const eventType = getEventType(event.description)
                                  return eventType === filterType
                                }).length > (window.innerWidth < 640 ? 1 : 2) && (
                                  <div
                                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                                    onClick={() => {
                                      setSelectedDate(day)
                                      setViewMode("list")
                                    }}
                                  >
                                    +
                                    {getEventsForDate(day).filter((event) => {
                                      if (filterType === "all") return true
                                      const eventType = getEventType(event.description)
                                      return eventType === filterType
                                    }).length - (window.innerWidth < 640 ? 1 : 2)}{" "}
                                    mais
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {/* Cabeçalho da lista com ordenação */}
                <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("date")}
                      className="text-xs sm:text-sm flex items-center gap-1"
                    >
                      Data
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("title")}
                      className="text-xs sm:text-sm flex items-center gap-1"
                    >
                      Título
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhum evento encontrado</p>
                    <Button variant="outline" size="sm" onClick={handleCreateNewClick} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar novo evento
                    </Button>
                  </div>
                ) : (
                  filteredEvents.map((event) => (
                    <Card
                      key={event.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getEventBorderColor(
                        getEventType(event.description),
                      )}`}
                      onClick={() => openViewDialog(event)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{event.title}</h3>
                              <Badge
                                className={`${getEventTypeColor(
                                  getEventType(event.description),
                                  event.isRecurring,
                                )} text-xs`}
                              >
                                {getEventType(event.description).charAt(0).toUpperCase() +
                                  getEventType(event.description).slice(1)}
                              </Badge>
                              {event.isRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  Recorrente
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2 sm:mb-3 text-xs sm:text-sm line-clamp-2">
                              {getCleanDescription(event.description)}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                              {event.occurrences.slice(0, 1).map((occurrence, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(occurrence.start).toLocaleDateString("pt-BR")}
                                  <Clock className="h-3 w-3 ml-2" />
                                  {new Date(occurrence.start).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              ))}
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 p-0">
                                <div className="flex flex-col">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openViewDialog(event)
                                    }}
                                  >
                                    <Info className="h-4 w-4 mr-2" />
                                    Ver detalhes
                                  </Button>
                                  {user?.accessLevel === "admin" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start text-sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          openEditDialog(event)
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start text-sm text-red-500 hover:text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteEvent(event.id)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
