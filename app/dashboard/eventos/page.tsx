"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, Plus, Loader2 } from "lucide-react"
import { eventsService, type CalendarEventResponse } from "@/services/events.service"
import { isAuthenticated, getUserRole } from "@/lib/auth-utils"

export default function EventosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<CalendarEventResponse[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userRole = getUserRole()
  const canManageEvents = userRole === "Admin" || userRole === "Pastor"

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    loadEvents()
  }, [router])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1

      const eventsData = await eventsService.getCalendarEvents(currentYear, currentMonth)
      setEvents(eventsData)
    } catch (error) {
      console.error("Erro ao carregar eventos:", error)
      setError("Erro ao carregar eventos. Tente novamente.")
      setEvents([]) // Deixar vazio em caso de erro
    } finally {
      setLoading(false)
    }
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Função para formatar horário
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

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">Gerencie os eventos da sua igreja</p>
        </div>
        {canManageEvents && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Recorrentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter((e) => e.isRecurring).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
          <Button variant="outline" size="sm" onClick={loadEvents} className="mt-2">
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error ? "Erro ao carregar eventos." : "Não há eventos cadastrados para este período."}
            </p>
            {canManageEvents && !error && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{event.title}</h3>
                      {event.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          Recorrente
                        </Badge>
                      )}
                    </div>
                    {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {event.occurrences.slice(0, 2).map((occurrence, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(occurrence.start)}</span>
                      </div>
                    ))}

                    {event.occurrences.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(event.occurrences[0].start)} - {formatTime(event.occurrences[0].end)}
                        </span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {canManageEvents && (
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver Detalhes
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
