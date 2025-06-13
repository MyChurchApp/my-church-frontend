"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Play, Square, AlertCircle, ChevronRight, RefreshCw } from "lucide-react"
import Link from "next/link"
import { worshipService, type WorshipService, WorshipStatus } from "@/services/worship.service"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import CultoHeader from "../components/culto-header"

export default function GestaoDecultoPage() {
  const [activeTab, setActiveTab] = useState<string>("not-started")
  const [notStartedServices, setNotStartedServices] = useState<WorshipService[]>([])
  const [inProgressServices, setInProgressServices] = useState<WorshipService[]>([])
  const [finishedServices, setFinishedServices] = useState<WorshipService[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Função para carregar os cultos
  const loadWorshipServices = async () => {
    setIsLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log("🔄 Iniciando carregamento de cultos...")

      // Carregar cultos não iniciados
      console.log("🔍 Buscando cultos não iniciados...")
      const notStarted = await worshipService.getWorshipByStatus(WorshipStatus.NotStarted)
      console.log(`✅ Cultos não iniciados obtidos: ${notStarted.length}`)
      setNotStartedServices(notStarted)

      // Carregar cultos em andamento
      console.log("🔍 Buscando cultos em andamento...")
      const inProgress = await worshipService.getWorshipByStatus(WorshipStatus.InProgress)
      console.log(`✅ Cultos em andamento obtidos: ${inProgress.length}`)
      setInProgressServices(inProgress)

      // Carregar cultos finalizados
      console.log("🔍 Buscando cultos finalizados...")
      const finished = await worshipService.getWorshipByStatus(WorshipStatus.Finished)
      console.log(`✅ Cultos finalizados obtidos: ${finished.length}`)
      setFinishedServices(finished)

      console.log("✅ Todos os cultos carregados com sucesso!")
      setDebugInfo(
        `Cultos carregados: ${notStarted.length} não iniciados, ${inProgress.length} em andamento, ${finished.length} finalizados`,
      )
    } catch (err: any) {
      console.error("❌ Erro ao carregar cultos:", err)
      setError(`Não foi possível carregar os cultos: ${err.message || "Erro desconhecido"}`)
      setDebugInfo(`Erro: ${JSON.stringify(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para iniciar um culto
  const handleStartWorship = async (id: number) => {
    try {
      console.log(`▶️ Iniciando culto ID: ${id}`)
      await worshipService.startWorship(id)
      console.log(`✅ Culto ID ${id} iniciado com sucesso!`)
      // Recarregar os cultos após iniciar
      loadWorshipServices()
    } catch (err: any) {
      console.error(`❌ Erro ao iniciar culto ID ${id}:`, err)
      setError(`Não foi possível iniciar o culto: ${err.message || "Erro desconhecido"}`)
    }
  }

  // Função para finalizar um culto
  const handleFinishWorship = async (id: number) => {
    try {
      console.log(`⏹️ Finalizando culto ID: ${id}`)
      await worshipService.finishWorship(id)
      console.log(`✅ Culto ID ${id} finalizado com sucesso!`)
      // Recarregar os cultos após finalizar
      loadWorshipServices()
    } catch (err: any) {
      console.error(`❌ Erro ao finalizar culto ID ${id}:`, err)
      setError(`Não foi possível finalizar o culto: ${err.message || "Erro desconhecido"}`)
    }
  }

  // Carregar cultos ao montar o componente
  useEffect(() => {
    console.log("🔄 Componente montado, carregando cultos...")
    loadWorshipServices()
  }, [])

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    } catch (e) {
      console.warn("⚠️ Erro ao formatar data:", e)
      return dateString
    }
  }

  // Renderizar card de culto
  const renderWorshipCard = (worship: WorshipService, status: WorshipStatus) => (
    <Card key={worship.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{worship.title || "Sem título"}</CardTitle>
            <CardDescription>{worship.theme || "Sem tema"}</CardDescription>
          </div>
          <Badge
            variant={
              status === WorshipStatus.NotStarted
                ? "outline"
                : status === WorshipStatus.InProgress
                  ? "default"
                  : "secondary"
            }
            className={
              status === WorshipStatus.NotStarted
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : status === WorshipStatus.InProgress
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
            }
          >
            {status === WorshipStatus.NotStarted
              ? "Não iniciado"
              : status === WorshipStatus.InProgress
                ? "Em andamento"
                : "Finalizado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>{worship.startTime ? formatDate(worship.startTime) : "Data não definida"}</span>
          </div>
          {worship.startTime && worship.endTime && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                Duração estimada:{" "}
                {Math.max(1, new Date(worship.endTime).getHours() - new Date(worship.startTime).getHours())} horas
              </span>
            </div>
          )}
          {worship.presencesCount > 0 && (
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <span>{worship.presencesCount} presentes</span>
            </div>
          )}
          {worship.activities && worship.activities.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Atividades: {worship.activities.length}</p>
              <div className="space-y-2">
                {worship.activities.slice(0, 2).map((activity) => (
                  <div key={activity.id} className="text-sm p-2 bg-gray-50 rounded-md">
                    <div className="font-medium">{activity.name || "Sem nome"}</div>
                    {activity.isCurrent && <Badge className="mt-1 bg-blue-100 text-blue-800">Atual</Badge>}
                  </div>
                ))}
                {worship.activities.length > 2 && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <span>+{worship.activities.length - 2} atividades</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2 border-t">
        <Link href={`/dashboard/culto/detalhes/${worship.id}`}>
          <Button variant="outline" size="sm">
            Ver detalhes
          </Button>
        </Link>
        {status === WorshipStatus.NotStarted && (
          <Button size="sm" onClick={() => handleStartWorship(worship.id)}>
            <Play className="h-4 w-4 mr-1" /> Iniciar
          </Button>
        )}
        {status === WorshipStatus.InProgress && (
          <Button size="sm" variant="destructive" onClick={() => handleFinishWorship(worship.id)}>
            <Square className="h-4 w-4 mr-1" /> Finalizar
          </Button>
        )}
      </CardFooter>
    </Card>
  )

  return (
    <div className="container mx-auto p-4">
      {/* Header com botão de voltar e menu mobile */}
      <CultoHeader title="Gestão de Culto" />

      {/* Botão de atualizar */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={loadWorshipServices}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Carregando..." : "Atualizar"}
        </Button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Debug info */}
      {debugInfo && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-blue-700 text-sm">
            <details>
              <summary className="cursor-pointer">Informações de debug</summary>
              <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Tabs para os diferentes status */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="not-started">Não iniciados</TabsTrigger>
          <TabsTrigger value="in-progress">Em andamento</TabsTrigger>
          <TabsTrigger value="finished">Finalizados</TabsTrigger>
        </TabsList>

        {/* Cultos não iniciados */}
        <TabsContent value="not-started">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando cultos não iniciados...</p>
            </div>
          ) : notStartedServices.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Não há cultos aguardando início.</p>
              </CardContent>
            </Card>
          ) : (
            notStartedServices.map((worship) => renderWorshipCard(worship, WorshipStatus.NotStarted))
          )}
        </TabsContent>

        {/* Cultos em andamento */}
        <TabsContent value="in-progress">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando cultos em andamento...</p>
            </div>
          ) : inProgressServices.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Não há cultos em andamento no momento.</p>
              </CardContent>
            </Card>
          ) : (
            inProgressServices.map((worship) => renderWorshipCard(worship, WorshipStatus.InProgress))
          )}
        </TabsContent>

        {/* Cultos finalizados */}
        <TabsContent value="finished">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando cultos finalizados...</p>
            </div>
          ) : finishedServices.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Não há cultos finalizados.</p>
              </CardContent>
            </Card>
          ) : (
            finishedServices.map((worship) => renderWorshipCard(worship, WorshipStatus.Finished))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
