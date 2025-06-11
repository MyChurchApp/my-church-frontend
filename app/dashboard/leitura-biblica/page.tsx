"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Book, Clock, Bug, BookOpen, AlertCircle, RefreshCw, Database } from "lucide-react"
import { useSignalR } from "../useSignalR"
import { getSpecificVerse, getVersesFromChapter } from "@/lib/bible-api"

interface BibleReading {
  id: string
  versionId: number
  bookId: number
  chapterId: number
  verseId?: number
  text: string
  book: string
  chapter: number
  verse?: number
  version: string
  timestamp: Date
  isFullChapter: boolean
  error?: boolean
  originalData?: any
}

export default function LeituraBiblicaPage() {
  const [readings, setReadings] = useState<BibleReading[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Usar o hook SignalR
  useSignalR(1)

  // Função para adicionar info de debug
  const addDebugInfo = (info: string) => {
    console.log("📝 Debug info:", info)
    setDebugInfo((prev) => [`${new Date().toLocaleTimeString()}: ${info}`, ...prev.slice(0, 8)])
  }

  // Função para buscar leitura bíblica da API real
  const fetchBibleReading = async (
    versionId: number,
    bookId: number,
    chapterId: number,
    verseId?: number,
    originalData?: any,
  ) => {
    console.log("🔍 fetchBibleReading chamada com parâmetros:")
    console.log("   versionId:", versionId)
    console.log("   bookId:", bookId)
    console.log("   chapterId:", chapterId)
    console.log("   verseId:", verseId)
    console.log("   originalData:", originalData)

    setIsLoading(true)
    const isFullChapter = !verseId

    const debugMessage = isFullChapter
      ? `Buscando: V${versionId}, L${bookId}, C${chapterId} (completo)`
      : `Buscando: V${versionId}, L${bookId}, C${chapterId}:${verseId}`

    addDebugInfo(debugMessage)

    try {
      let data
      let text
      let bookName = `Livro ${bookId}`
      let versionName = `Versão ${versionId}`

      if (isFullChapter) {
        console.log("📚 Buscando capítulo completo...")
        // Buscar capítulo completo
        data = await getVersesFromChapter(chapterId)
        console.log("📚 Dados do capítulo recebidos:", data)

        // Concatenar todos os versículos ou pegar o primeiro parágrafo
        if (Array.isArray(data)) {
          text =
            data
              .slice(0, 3)
              .map((v: any) => v.text)
              .join(" ") + "..." // Primeiros 3 versículos
          console.log("📚 Texto do capítulo processado:", text.substring(0, 100) + "...")
        } else {
          text = "Texto do capítulo não disponível"
          console.log("📚 Texto do capítulo não disponível")
        }
      } else {
        console.log("📖 Buscando versículo específico...")
        // Buscar versículo específico
        data = await getSpecificVerse(chapterId, verseId!)
        console.log("📖 Dados do versículo recebidos:", data)

        text = data?.text || `Versículo ${chapterId}:${verseId} não encontrado`
        console.log("📖 Texto do versículo:", text)
      }

      // Tentar obter nomes dos dados da API
      if (data?.book) {
        bookName = data.book
        console.log("📚 Nome do livro da API:", bookName)
      }
      if (data?.version) {
        versionName = data.version
        console.log("📚 Nome da versão da API:", versionName)
      }

      const newReading: BibleReading = {
        id: `${versionId}-${bookId}-${chapterId}-${verseId || "full"}-${Date.now()}`,
        versionId,
        bookId,
        chapterId,
        verseId,
        text,
        book: bookName,
        chapter: chapterId,
        verse: verseId,
        version: versionName,
        timestamp: new Date(),
        isFullChapter,
        originalData,
      }

      console.log("✅ Nova leitura criada:", newReading)

      // Adicionar nova leitura no topo da lista
      setReadings((prev) => [newReading, ...prev])

      const successMessage = isFullChapter
        ? `✅ Capítulo carregado: ${versionName} - ${bookName} ${chapterId}`
        : `✅ Versículo carregado: ${versionName} - ${bookName} ${chapterId}:${verseId}`

      addDebugInfo(successMessage)
    } catch (error) {
      console.error("❌ Erro ao buscar leitura bíblica:", error)
      console.error("❌ Stack trace:", (error as Error).stack)

      // Criar leitura com erro
      const errorReading: BibleReading = {
        id: `error-${versionId}-${bookId}-${chapterId}-${verseId || "full"}-${Date.now()}`,
        versionId,
        bookId,
        chapterId,
        verseId,
        text: "Erro ao carregar o texto bíblico. Verifique sua conexão ou autenticação.",
        book: `Livro ${bookId}`,
        chapter: chapterId,
        verse: verseId,
        version: `Versão ${versionId}`,
        timestamp: new Date(),
        isFullChapter,
        error: true,
        originalData,
      }

      console.log("❌ Leitura de erro criada:", errorReading)
      setReadings((prev) => [errorReading, ...prev])
      addDebugInfo(`❌ Erro: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
      console.log("🏁 fetchBibleReading finalizada")
    }
  }

  // Exemplos de teste com versões
  const testReadings = [
    { versionId: 1, bookId: 1, chapterId: 1, verseId: 1, name: "V1 - Gn 1:1" },
    { versionId: 1, bookId: 43, chapterId: 3, verseId: 16, name: "V1 - Jo 3:16" },
    { versionId: 2, bookId: 19, chapterId: 23, verseId: 1, name: "V2 - Sl 23:1" },
  ]

  const testChapters = [
    { versionId: 1, bookId: 1, chapterId: 1, name: "V1 - Gn 1" },
    { versionId: 1, bookId: 19, chapterId: 23, name: "V1 - Sl 23" },
  ]

  // Escutar eventos do SignalR globalmente
  useEffect(() => {
    console.log("👂 Configurando listener para eventos de leitura bíblica...")

    const handleBibleReading = (event: CustomEvent) => {
      console.log("🎯 ===== EVENTO CUSTOMIZADO RECEBIDO NA PÁGINA =====")
      console.log("🎯 Event detail:", event.detail)

      const { versionId, bookId, chapterId, verseId, isFullChapter, apiData, error, originalData } = event.detail

      const eventMessage = `📡 Evento: V${versionId}, L${bookId}, C${chapterId}${verseId ? `:${verseId}` : " (completo)"}`
      console.log(eventMessage)
      addDebugInfo(eventMessage)

      if (apiData) {
        console.log("✅ Evento já tem dados da API, processando diretamente...")
        console.log("📊 API Data:", apiData)

        // Extrair dados corretos da API
        const text = apiData.content?.text || "Texto não disponível"
        const bookName = apiData.bookName || `Livro ${bookId}`
        const versionName = apiData.versionName || `Versão ${versionId}`

        console.log("📖 Dados extraídos:")
        console.log("   text:", text)
        console.log("   bookName:", bookName)
        console.log("   versionName:", versionName)

        const newReading: BibleReading = {
          id: `${versionId}-${bookId}-${chapterId}-${verseId || "full"}-${Date.now()}`,
          versionId,
          bookId,
          chapterId,
          verseId,
          text,
          book: bookName, // Usar nome real do livro
          chapter: chapterId,
          verse: verseId,
          version: versionName, // Usar nome real da versão
          timestamp: new Date(),
          isFullChapter,
          error: false,
          originalData,
        }

        console.log("✅ Nova leitura criada diretamente:", newReading)
        setReadings((prev) => [newReading, ...prev])
        addDebugInfo(`✅ Leitura adicionada: ${versionName} - ${bookName}`)
      } else if (error) {
        console.log("❌ Evento tem erro, criando leitura de erro...")

        // Se houve erro, criar leitura de erro
        const errorReading: BibleReading = {
          id: `error-${versionId}-${bookId}-${chapterId}-${verseId || "full"}-${Date.now()}`,
          versionId,
          bookId,
          chapterId,
          verseId,
          text: "Erro ao carregar o texto bíblico. Verifique sua conexão ou autenticação.",
          book: `Livro ${bookId}`,
          chapter: chapterId,
          verse: verseId,
          version: `Versão ${versionId}`,
          timestamp: new Date(),
          isFullChapter,
          error: true,
          originalData,
        }

        console.log("❌ Leitura de erro criada:", errorReading)
        setReadings((prev) => [errorReading, ...prev])
        addDebugInfo(`❌ Erro no evento SignalR`)
      } else {
        console.log("🔍 Evento não tem dados nem erro, buscando na API...")
        // Buscar dados da API
        fetchBibleReading(versionId, bookId, chapterId, verseId, originalData)
      }

      console.log("🎯 ===== FIM DO PROCESSAMENTO DO EVENTO NA PÁGINA =====")
    }

    window.addEventListener("bibleReadingHighlighted", handleBibleReading as EventListener)

    return () => {
      console.log("👂 Removendo listener de eventos de leitura bíblica...")
      window.removeEventListener("bibleReadingHighlighted", handleBibleReading as EventListener)
    }
  }, [])

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Leitura Bíblica</h1>
        <div className="flex gap-2 flex-wrap">
          {/* Versículos específicos */}
          {testReadings.map((test) => (
            <Button
              key={`${test.versionId}-${test.bookId}-${test.chapterId}-${test.verseId}`}
              onClick={() => {
                console.log("🔘 Botão de teste clicado:", test)
                fetchBibleReading(test.versionId, test.bookId, test.chapterId, test.verseId)
              }}
              variant="outline"
              size="sm"
              disabled={isLoading}
              title={`Testar: Versão ${test.versionId}, Livro ${test.bookId}, Capítulo ${test.chapterId}, Versículo ${test.verseId}`}
            >
              <Book className="h-4 w-4 mr-2" />
              {test.name}
            </Button>
          ))}

          {/* Capítulos completos */}
          {testChapters.map((test) => (
            <Button
              key={`${test.versionId}-${test.bookId}-${test.chapterId}`}
              onClick={() => {
                console.log("🔘 Botão de capítulo clicado:", test)
                fetchBibleReading(test.versionId, test.bookId, test.chapterId)
              }}
              variant="secondary"
              size="sm"
              disabled={isLoading}
              title={`Testar: Versão ${test.versionId}, Livro ${test.bookId}, Capítulo ${test.chapterId} completo`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {test.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Status de conexão */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-gray-600">Conectado ao sistema de leitura bíblica</span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="mb-4">
          <CardContent className="p-4 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin text-blue-500" />
            <span>Carregando texto bíblico...</span>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {debugInfo.length > 0 && (
        <Card className="mb-4 bg-gray-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Bug className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Debug Info (Console tem mais detalhes)</span>
            </div>
            <div className="space-y-1">
              {debugInfo.map((info, index) => (
                <p key={index} className="text-xs text-gray-600 font-mono">
                  {info}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de leituras */}
      <div className="space-y-4">
        {readings.length === 0 && !isLoading ? (
          <Card>
            <CardContent className="p-4 text-center">
              <Book className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aguardando leituras bíblicas...</p>
              <p className="text-xs text-gray-400 mt-1">Use os botões acima para testar versículos ou capítulos</p>
            </CardContent>
          </Card>
        ) : (
          readings.map((reading, index) => (
            <Card
              key={reading.id}
              className={`mb-4 ${index === 0 ? "ring-2 ring-blue-200" : ""} ${reading.error ? "border-red-200" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {reading.error ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : reading.isFullChapter ? (
                      <BookOpen className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Book className="h-4 w-4 text-blue-600" />
                    )}
                    <span className={`font-medium ${reading.error ? "text-red-600" : ""}`}>
                      {reading.version} - {reading.book} {reading.chapter}
                      {reading.isFullChapter ? " (capítulo completo)" : `:${reading.verse}`}
                    </span>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Mais recente
                      </Badge>
                    )}
                    {reading.isFullChapter && !reading.error && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                        Capítulo
                      </Badge>
                    )}
                    {reading.error && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                        Erro
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      <Database className="h-3 w-3 mr-1" />V{reading.versionId}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {reading.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
                <p
                  className={`text-gray-700 border-l-2 pl-3 italic ${
                    reading.error
                      ? "border-red-300 text-red-600"
                      : reading.isFullChapter
                        ? "border-purple-200"
                        : "border-blue-200"
                  }`}
                >
                  "{reading.text}"
                </p>
                {reading.originalData && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">Dados originais do SignalR</summary>
                    <pre className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(reading.originalData, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
