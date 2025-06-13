"use client"

import { Calendar } from "@/components/ui/calendar"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { isAuthenticated } from "@/lib/auth-utils"
import { authFetch } from "@/lib/auth-fetch"
import { AlertCircle, CheckCircle, Clock, Music, Book, Users, ChevronRight } from "lucide-react"

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

export default function AcompanharCultoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("em-andamento")
  const [worshipServices, setWorshipServices] = useState<WorshipService[]>([])
  const [currentService, setCurrentService] = useState<WorshipService | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

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

        // Definir o culto atual (em andamento ou o próximo)
        const inProgressService = mockServices.find((s) => s.status === "in-progress")
        const nextService = mockServices
          .filter((s) => s.status === "scheduled")
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

        setCurrentService(inProgressService || nextService || null)
      } else {
        console.log("Erro ao carregar cultos:", response.status)
        // Usar dados de exemplo em caso de erro
        const mockServices = getMockWorshipServices()
        setWorshipServices(mockServices)
        setCurrentService(mockServices[0])
      }
    } catch (error) {
      console.error("Erro ao carregar cultos:", error)
      setError("Erro ao carregar dados dos cultos. Tente novamente.")

      // Usar dados de exemplo em caso de erro
      const mockServices = getMockWorshipServices()
      setWorshipServices(mockServices)
      setCurrentService(mockServices[0])
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

  // Função para obter o ícone do tipo de item
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "praise":
        return <Music className="h-5 w-5" />
      case "sermon":
        return <Book className="h-5 w-5" />
      case "reading":
        return <Book className="h-5 w-5" />
      case "offering":
        return <ChevronRight className="h-5 w-5" />
      case "announcement":
        return <ChevronRight className="h-5 w-5" />
      case "prayer":
        return <ChevronRight className="h-5 w-5" />
      default:
        return <ChevronRight className="h-5 w-5" />
    }
  }

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Função para obter o ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Acompanhar Culto</h1>
        <p className="text-gray-600">Acompanhe o andamento dos cultos em tempo real</p>
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

      {/* Tabs */}
      <Tabs defaultValue="em-andamento" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="em-andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="programados">Programados</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
        </TabsList>

        {/* Em Andamento */}
        <TabsContent value="em-andamento">
          {worshipServices.filter((service) => service.status === "in-progress").length > 0 ? (
            <div className="space-y-6">
              {worshipServices
                .filter((service) => service.status === "in-progress")
                .map((service) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{service.title}</CardTitle>
                          <p className="text-gray-600 text-sm">
                            {formatDate(service.date)} • {service.startTime} - {service.endTime}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-700">{service.attendees} presentes</span>
                          </div>
                          <div className="text-gray-700">{service.location}</div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-medium">Programação</h3>
                          <div className="space-y-3">
                            {service.items.map((item) => (
                              <div key={item.id} className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-full ${
                                    item.status === "completed"
                                      ? "bg-green-100"
                                      : item.status === "in-progress"
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                                  }`}
                                >
                                  {getItemTypeIcon(item.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <h4 className="font-medium">{item.title}</h4>
                                    <Badge className={getStatusColor(item.status)}>
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(item.status)}
                                        <span>
                                          {item.status === "completed"
                                            ? "Concluído"
                                            : item.status === "in-progress"
                                              ? "Em andamento"
                                              : "Pendente"}
                                        </span>
                                      </div>
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{item.responsible}</span>
                                    <span>{item.duration} min</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
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

        {/* Programados */}
        <TabsContent value="programados">
          {worshipServices.filter((service) => service.status === "scheduled").length > 0 ? (
            <div className="space-y-4">
              {worshipServices
                .filter((service) => service.status === "scheduled")
                .map((service) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{service.title}</CardTitle>
                          <p className="text-gray-600 text-sm">
                            {formatDate(service.date)} • {service.startTime} - {service.endTime}
                          </p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800">Programado</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{service.description}</p>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Local: {service.location}</span>
                        <span>{service.items.length} itens na programação</span>
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
                <Button onClick={() => router.push("/dashboard/culto/gestao")}>Programar Novo Culto</Button>
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
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{service.title}</CardTitle>
                          <p className="text-gray-600 text-sm">
                            {formatDate(service.date)} • {service.startTime} - {service.endTime}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{service.description}</p>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Local: {service.location}</span>
                        <span>Presentes: {service.attendees}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
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
