"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Play, Square, AlertCircle, RefreshCw, ArrowLeft, BookOpen, Music } from "lucide-react"
import { worshipService, type WorshipService, WorshipStatus } from "@/services/worship.service"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import CultoHeader from "../../components/culto-header"

export default function DetalhesDocultoPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [worship, setWorship] = useState<WorshipService | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Função para carregar os detalhes do culto
  const loadWorshipDetails = async () => {
    if (!id || isNaN(id)) {
      setError("ID do culto inválido")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`🔍 Buscando detalhes do culto ID: ${id}`)
      const worshipData = await worshipService.getWorshipById(id)
      console.log("✅ Detalhes do culto obtidos:", worshipData)
      setWorship(worshipData)
    } catch (err: any) {
      console.error(`❌ Erro ao buscar detalhes do culto ID ${id}:`, err)
      setError(`Não foi possível carregar os detalhes do culto: ${err.message || "Erro desconhecido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para iniciar um culto
  const handleStartWorship = async () => {
    if (!worship) return

    try {
      console.log(`▶️ Iniciando culto ID: ${worship.id}`)
      await worshipService.startWorship(worship.id)
      console.log(`✅ Culto ID ${worship.id} iniciado com sucesso!`)
      // Recarregar os detalhes após iniciar
      loadWorshipDetails()
    } catch (err: any) {
      console.error(`❌ Erro ao iniciar culto ID ${worship.id}:`, err)
      setError(`Não foi possível iniciar o culto: ${err.message || "Erro desconhecido"}`)
    }
  }

  // Função para finalizar um culto
  const handleFinishWorship = async () => {
    if (!worship) return

    try {
      console.log(`⏹️ Finalizando culto ID: ${worship.id}`)
      await worshipService.finishWorship(worship.id)
      console.log(`✅ Culto ID ${worship.id} finalizado com sucesso!`)
      // Recarregar os detalhes após finalizar
      loadWorshipDetails()
    } catch (err: any) {
      console.error(`❌ Erro ao finalizar culto ID ${worship.id}:`, err)
      setError(`Não foi possível finalizar o culto: ${err.message || "Erro desconhecido"}`)
    }
  }

  // Carregar detalhes do culto ao montar o componente
  useEffect(() => {
    loadWorshipDetails()
  }, [id])

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

  // Função para obter o status do culto
  const getWorshipStatus = (status: number) => {
    switch (status) {
      case WorshipStatus.NotStarted:
        return { label: "Não iniciado", color: "bg-yellow-50 text-yellow-700 border-yellow-200" }
      case WorshipStatus.InProgress:
        return { label: "Em andamento", color: "bg-green-100 text-green-800" }
      case WorshipStatus.Finished:
        return { label: "Finalizado", color: "bg-gray-100 text-gray-800" }
      default:
        return { label: "Desconhecido", color: "bg-gray-100 text-gray-800" }
    }
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header com botão de voltar e menu mobile */}
      <CultoHeader title="Detalhes do Culto" backUrl="/dashboard/culto/gestao" />

      {/* Botão de atualizar */}
      <div className="mb-4">
        <Button variant="outline" onClick={loadWorshipDetails} disabled={isLoading} className="flex items-center gap-2">
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

      {/* Loading state */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando detalhes do culto...</p>
        </div>
      ) : worship ? (
        <div className="space-y-6">
          {/* Informações principais */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{worship.title || "Sem título"}</CardTitle>
                  <CardDescription className="text-base">{worship.theme || "Sem tema"}</CardDescription>
                </div>
                <Badge
                  variant={worship.status === WorshipStatus.NotStarted ? "outline" : "default"}
                  className={getWorshipStatus(worship.status).color}
                >
                  {getWorshipStatus(worship.status).label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{worship.startTime ? formatDate(worship.startTime) : "Data não definida"}</span>
                </div>
                {worship.startTime && worship.endTime && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                      Duração estimada:{" "}
                      {Math.max(1, new Date(worship.endTime).getHours() - new Date(worship.startTime).getHours())} horas
                    </span>
                  </div>
                )}
                {worship.presencesCount > 0 && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{worship.presencesCount} presentes</span>
                  </div>
                )}
                {worship.description && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Descrição:</h3>
                    <p className="text-gray-700">{worship.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2 border-t">
              {worship.status === WorshipStatus.NotStarted && (
                <Button onClick={handleStartWorship}>
                  <Play className="h-4 w-4 mr-1" /> Iniciar Culto
                </Button>
              )}
              {worship.status === WorshipStatus.InProgress && (
                <Button variant="destructive" onClick={handleFinishWorship}>
                  <Square className="h-4 w-4 mr-1" /> Finalizar Culto
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Atividades */}
          {worship.activities && worship.activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atividades</CardTitle>
                <CardDescription>Lista de atividades programadas para este culto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {worship.activities.map((activity) => (
                    <Card key={activity.id} className={activity.isCurrent ? "border-blue-300 bg-blue-50" : ""}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{activity.name || "Sem nome"}</CardTitle>
                          {activity.isCurrent && <Badge className="bg-blue-100 text-blue-800">Atual</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        {activity.content && <p className="text-sm text-gray-700">{activity.content}</p>}

                        {/* Bíblias */}
                        {activity.bibles && activity.bibles.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Leituras Bíblicas:</h4>
                            <div className="space-y-2">
                              {activity.bibles.map((bible) => (
                                <div key={bible.id} className="flex items-center text-sm p-2 bg-gray-100 rounded-md">
                                  <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                                  <span>
                                    Versão {bible.bibleVersionId}, Livro {bible.bookId}, Capítulo {bible.chapterId}
                                    {bible.verseStart && bible.verseEnd
                                      ? `, Versículos ${bible.verseStart}-${bible.verseEnd}`
                                      : bible.verseStart
                                        ? `, Versículo ${bible.verseStart}`
                                        : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hinos */}
                        {activity.hymns && activity.hymns.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Hinos:</h4>
                            <div className="space-y-2">
                              {activity.hymns.map((hymn) => (
                                <div key={hymn.id} className="flex items-center text-sm p-2 bg-gray-100 rounded-md">
                                  <Music className="h-4 w-4 mr-2 text-purple-600" />
                                  <span>
                                    {hymn.hymnTitle || `Hino ${hymn.hymnNumber || hymn.hymnId}`}
                                    {hymn.hymnNumber && ` (${hymn.hymnNumber})`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Programação */}
          {worship.schedule && worship.schedule.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Programação</CardTitle>
                <CardDescription>Cronograma do culto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {worship.schedule
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <div key={item.id} className="flex items-center p-3 border-b last:border-0">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="font-medium text-gray-700">{item.order}</span>
                        </div>
                        <span>{item.name}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-700">Culto não encontrado</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/culto/gestao")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Gestão de Culto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
