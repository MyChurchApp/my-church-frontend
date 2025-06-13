"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { isAuthenticated } from "@/lib/auth-utils"
import { authFetch } from "@/lib/auth-fetch"
import { AlertCircle, Calendar, Clock, Plus, ChevronRight } from "lucide-react"

// Interface para os dados do culto
interface WorshipService {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  description: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  location: string
  attendees: number
  items: WorshipItem[]
}

// Interface para os itens do culto
interface WorshipItem {
  id: number
  title: string
  description: string
  duration: number // em minutos
  type: "praise" | "sermon" | "offering" | "announcement" | "prayer" | "reading" | "other"
  responsible: string
  order: number
  status: "pending" | "in-progress" | "completed"
  notes?: string
}

export default function GestaoCultoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("todos")
  const [worshipServices, setWorshipServices] = useState<WorshipService[]>([])
  const [isCreatingService, setIsCreatingService] = useState(false)
  const [isEditingService, setIsEditingService] = useState(false)
  const [currentService, setCurrentService] = useState<WorshipService | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Formulário para novo culto
  const [newServiceForm, setNewServiceForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    location: "",
  })

  useEffect(() => {
    // Verificar autenticação
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    loadWorshipServices()
  }, [router])

  const loadWorshipServices = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Tentar carregar dados reais da API
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Worship`)

      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)

        // Processar dados da API
        // Implementar quando a API estiver disponível

        // Por enquanto, usar dados de exemplo
        const mockServices = getMockWorshipServices()
        setWorshipServices(mockServices)
      } else {
        console.log("Erro ao carregar cultos:", response.status)
        // Usar dados de exemplo em caso de erro
        const mockServices = getMockWorshipServices()
        setWorshipServices(mockServices)
      }
    } catch (error) {
      console.error("Erro ao carregar cultos:", error)
      setError("Erro ao carregar dados dos cultos. Tente novamente.")

      // Usar dados de exemplo em caso de erro
      const mockServices = getMockWorshipServices()
      setWorshipServices(mockServices)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para obter dados de exemplo
  const getMockWorshipServices = (): WorshipService[] => {
    return [
      {
        id: 1,
        title: "Culto de Domingo",
        date: "2025-06-16",
        startTime: "10:00",
        endTime: "12:00",
        description: "Culto dominical com louvor e pregação",
        status: "in-progress",
        location: "Templo Principal",
        attendees: 120,
        items: [
          {
            id: 101,
            title: "Abertura e Boas-vindas",
            description: "Saudação inicial e boas-vindas aos presentes",
            duration: 5,
            type: "other",
            responsible: "Pr. João Silva",
            order: 1,
            status: "completed",
          },
          {
            id: 102,
            title: "Momento de Louvor",
            description: "Louvor conduzido pelo ministério de música",
            duration: 20,
            type: "praise",
            responsible: "Ministério de Louvor",
            order: 2,
            status: "completed",
          },
          {
            id: 103,
            title: "Leitura Bíblica",
            description: "Salmos 23",
            duration: 5,
            type: "reading",
            responsible: "Diácono Pedro",
            order: 3,
            status: "in-progress",
          },
          {
            id: 104,
            title: "Pregação",
            description: "Tema: O Bom Pastor",
            duration: 40,
            type: "sermon",
            responsible: "Pr. João Silva",
            order: 4,
            status: "pending",
          },
          {
            id: 105,
            title: "Oferta e Dízimos",
            description: "Momento de contribuição",
            duration: 10,
            type: "offering",
            responsible: "Ministério de Finanças",
            order: 5,
            status: "pending",
          },
          {
            id: 106,
            title: "Avisos",
            description: "Comunicados da semana",
            duration: 5,
            type: "announcement",
            responsible: "Secretária Maria",
            order: 6,
            status: "pending",
          },
          {
            id: 107,
            title: "Oração Final",
            description: "Encerramento e bênção",
            duration: 5,
            type: "prayer",
            responsible: "Pr. João Silva",
            order: 7,
            status: "pending",
          },
        ],
      },
      {
        id: 2,
        title: "Culto de Quarta-feira",
        date: "2025-06-19",
        startTime: "19:30",
        endTime: "21:00",
        description: "Culto de ensino bíblico",
        status: "scheduled",
        location: "Templo Principal",
        attendees: 0,
        items: [
          {
            id: 201,
            title: "Abertura e Oração",
            description: "Momento inicial de oração",
            duration: 10,
            type: "prayer",
            responsible: "Pr. Carlos",
            order: 1,
            status: "pending",
          },
          {
            id: 202,
            title: "Louvor",
            description: "Momento de adoração",
            duration: 15,
            type: "praise",
            responsible: "Equipe de Louvor",
            order: 2,
            status: "pending",
          },
          {
            id: 203,
            title: "Estudo Bíblico",
            description: "Tema: Epístola aos Romanos",
            duration: 45,
            type: "sermon",
            responsible: "Pr. Carlos",
            order: 3,
            status: "pending",
          },
          {
            id: 204,
            title: "Encerramento",
            description: "Oração final e despedida",
            duration: 5,
            type: "prayer",
            responsible: "Pr. Carlos",
            order: 4,
            status: "pending",
          },
        ],
      },
    ]
  }

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Função para obter a cor do status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-gray-100 text-gray-800">Programado</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Programado</Badge>
    }
  }

  // Função para criar um novo culto
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!newServiceForm.title || !newServiceForm.date || !newServiceForm.startTime || !newServiceForm.endTime) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    try {
      // Criar novo culto (mock)
      const newService: WorshipService = {
        id: Math.floor(Math.random() * 1000) + 100,
        title: newServiceForm.title,
        date: newServiceForm.date,
        startTime: newServiceForm.startTime,
        endTime: newServiceForm.endTime,
        description: newServiceForm.description,
        location: newServiceForm.location,
        status: "scheduled",
        attendees: 0,
        items: [],
      }

      // Adicionar à lista
      setWorshipServices([...worshipServices, newService])

      // Resetar formulário
      setNewServiceForm({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        description: "",
        location: "",
      })

      setIsCreatingService(false)

      // Aqui você faria a chamada real para a API
      // const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Worship`, {
      //   method: "POST",
      //   body: JSON.stringify(newService)
      // })
    } catch (error) {
      console.error("Erro ao criar culto:", error)
      alert("Erro ao criar culto. Tente novamente.")
    }
  }

  // Função para testar a API
  const testApi = async () => {
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Worship`)
      const data = await response.json()
      setDebugInfo(data)
      alert("Dados recebidos da API! Verifique o console.")
      console.log("Dados da API:", data)
    } catch (error) {
      console.error("Erro ao testar API:", error)
      alert("Erro ao testar API. Verifique o console.")
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Cultos</h1>
          <p className="text-gray-600">Crie e gerencie os cultos da sua igreja</p>
        </div>
        <Button onClick={() => setIsCreatingService(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Culto
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Erro ao carregar dados</p>
            <p className="text-red-700">{error}</p>
            <Button variant="outline" size="sm" onClick={loadWorshipServices} className="mt-2">
              Tentar Novamente
            </Button>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {debugInfo && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
          </CardContent>
        </Card>
      )}

      {/* Test API Button */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={testApi}>
          Testar API
        </Button>
        <Button variant="outline" size="sm" onClick={loadWorshipServices}>
          Recarregar Dados
        </Button>
      </div>

      {/* Create Service Form */}
      {isCreatingService && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Culto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newServiceForm.title}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, title: e.target.value })}
                    placeholder="Ex: Culto de Domingo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    value={newServiceForm.location}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, location: e.target.value })}
                    placeholder="Ex: Templo Principal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newServiceForm.date}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Hora de Início</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newServiceForm.startTime}
                      onChange={(e) => setNewServiceForm({ ...newServiceForm, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora de Término</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newServiceForm.endTime}
                      onChange={(e) => setNewServiceForm({ ...newServiceForm, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newServiceForm.description}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                    placeholder="Descreva o culto..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreatingService(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Culto</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="programados">Programados</TabsTrigger>
          <TabsTrigger value="em-andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
        </TabsList>

        {/* Todos */}
        <TabsContent value="todos">
          {worshipServices.length > 0 ? (
            <div className="space-y-4">
              {worshipServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{service.title}</h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(service.date)} • {service.startTime} - {service.endTime}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{service.location}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(service.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600"
                          onClick={() => router.push(`/dashboard/culto/gestao/${service.id}`)}
                        >
                          Gerenciar
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum culto encontrado</h3>
                <p className="text-gray-600 mb-4">Comece criando seu primeiro culto</p>
                <Button onClick={() => setIsCreatingService(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Culto
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Programados */}
        <TabsContent value="programados">
          {worshipServices.filter((service) => service.status === "scheduled").length > 0 ? (
            <div className="space-y-4">
              {worshipServices
                .filter((service) => service.status === "scheduled")
                .map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{service.title}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(service.date)} • {service.startTime} - {service.endTime}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{service.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-gray-100 text-gray-800">Programado</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600"
                            onClick={() => router.push(`/dashboard/culto/gestao/${service.id}`)}
                          >
                            Gerenciar
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum culto programado</h3>
                <p className="text-gray-600 mb-4">Não há cultos agendados para os próximos dias</p>
                <Button onClick={() => setIsCreatingService(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Programar Culto
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Em Andamento */}
        <TabsContent value="em-andamento">
          {worshipServices.filter((service) => service.status === "in-progress").length > 0 ? (
            <div className="space-y-4">
              {worshipServices
                .filter((service) => service.status === "in-progress")
                .map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{service.title}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(service.date)} • {service.startTime} - {service.endTime}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{service.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600"
                            onClick={() => router.push(`/dashboard/culto/acompanhar`)}
                          >
                            Acompanhar
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum culto em andamento</h3>
                <p className="text-gray-600 mb-4">No momento não há cultos acontecendo</p>
                <Button onClick={() => setActiveTab("programados")}>Ver Cultos Programados</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Concluídos */}
        <TabsContent value="concluidos">
          {worshipServices.filter((service) => service.status === "completed").length > 0 ? (
            <div className="space-y-4">
              {worshipServices
                .filter((service) => service.status === "completed")
                .map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{service.title}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(service.date)} • {service.startTime} - {service.endTime}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{service.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600"
                            onClick={() => router.push(`/dashboard/culto/gestao/${service.id}`)}
                          >
                            Detalhes
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum culto concluído</h3>
                <p className="text-gray-600 mb-4">Não há registros de cultos concluídos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
