"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Filter,
  Edit,
  Trash2,
} from "lucide-react"
import { getUser, getEvents, type User, type Event } from "@/lib/fake-api"

export default function EventosPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [filterType, setFilterType] = useState<string>("all")

  // Form state for new/edit event
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "",
  })

  useEffect(() => {
    const userData = getUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
    setEvents(getEvents())
  }, [router])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      culto: "bg-blue-100 text-blue-800 border-blue-200",
      evento: "bg-green-100 text-green-800 border-green-200",
      reuniao: "bg-purple-100 text-purple-800 border-purple-200",
      estudo: "bg-orange-100 text-orange-800 border-orange-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.type) return

    // Simular criação do evento
    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
      organizer: user?.name || "",
      attendees: 0,
    }

    setEvents([...events, event])
    setNewEvent({ title: "", description: "", date: "", time: "", location: "", type: "" })
    setIsCreateDialogOpen(false)
  }

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent || !newEvent.title || !newEvent.date || !newEvent.time || !newEvent.type) return

    const updatedEvent: Event = {
      ...selectedEvent,
      ...newEvent,
    }

    setEvents(events.map((event) => (event.id === selectedEvent.id ? updatedEvent : event)))
    setNewEvent({ title: "", description: "", date: "", time: "", location: "", type: "" })
    setSelectedEvent(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      setEvents(events.filter((event) => event.id !== eventId))
      setIsEditDialogOpen(false)
      setSelectedEvent(null)
    }
  }

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event)
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
    })
    setIsEditDialogOpen(true)
  }

  const filteredEvents = events.filter((event) => {
    if (filterType === "all") return true
    return event.type === filterType
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

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
              <p className="text-gray-600">Gerencie os eventos da igreja</p>
            </div>
            <div className="flex items-center gap-4">
              {user.accessLevel === "admin" && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Evento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-title">Título</Label>
                        <Input
                          id="event-title"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          placeholder="Nome do evento"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event-type">Tipo</Label>
                        <Select
                          value={newEvent.type}
                          onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                        >
                          <SelectTrigger>
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="event-date">Data</Label>
                          <Input
                            id="event-date"
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-time">Horário</Label>
                          <Input
                            id="event-time"
                            type="time"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event-location">Local</Label>
                        <Input
                          id="event-location"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          placeholder="Local do evento"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event-description">Descrição</Label>
                        <Textarea
                          id="event-description"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          placeholder="Descrição do evento"
                          rows={3}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Criar Evento
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Edit Event Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-event-title">Título</Label>
                <Input
                  id="edit-event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Nome do evento"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-type">Tipo</Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                  <SelectTrigger>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-date">Data</Label>
                  <Input
                    id="edit-event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-event-time">Horário</Label>
                  <Input
                    id="edit-event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-location">Local</Label>
                <Input
                  id="edit-event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Local do evento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-description">Descrição</Label>
                <Textarea
                  id="edit-event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Descrição do evento"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Salvar Alterações
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Filters */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="culto">Cultos</SelectItem>
                    <SelectItem value="evento">Eventos</SelectItem>
                    <SelectItem value="reuniao">Reuniões</SelectItem>
                    <SelectItem value="estudo">Estudos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {viewMode === "calendar" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                        Hoje
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {weekDays.map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentDate).map((day, index) => (
                      <div
                        key={index}
                        className={`min-h-24 p-1 border border-gray-100 ${
                          day ? "bg-white hover:bg-gray-50" : "bg-gray-50"
                        }`}
                      >
                        {day && (
                          <>
                            <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                            <div className="space-y-1">
                              {getEventsForDate(day)
                                .filter((event) => filterType === "all" || event.type === filterType)
                                .slice(0, 2)
                                .map((event) => (
                                  <div
                                    key={event.id}
                                    className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                                    onClick={() => user?.accessLevel === "admin" && openEditDialog(event)}
                                  >
                                    <div className="font-medium truncate">{event.title}</div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {event.time}
                                    </div>
                                  </div>
                                ))}
                              {getEventsForDate(day).filter(
                                (event) => filterType === "all" || event.type === filterType,
                              ).length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +
                                  {getEventsForDate(day).filter(
                                    (event) => filterType === "all" || event.type === filterType,
                                  ).length - 2}{" "}
                                  mais
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    className={user?.accessLevel === "admin" ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
                  >
                    <CardContent className="p-4" onClick={() => user?.accessLevel === "admin" && openEditDialog(event)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </Badge>
                            {user?.accessLevel === "admin" && <Edit className="h-4 w-4 text-gray-400" />}
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.date).toLocaleDateString("pt-BR")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.time}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </div>
                            )}
                            {event.attendees !== undefined && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.attendees} participantes
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Organizado por</p>
                          <p className="font-medium">{event.organizer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
