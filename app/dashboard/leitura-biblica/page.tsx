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
    setDebugInfo((prev) => [`${new Date().toLocaleTimeString()}: ${info}`, ...prev.slice(0, 6)])
  }

  // Função para buscar leitura bíblica da API real
  const fetchBibleReading = async (
    versionId: number,
    bookId: number,
    chapterId: number,
    verseId?: number,
    originalData?: any,
  ) => {
    setIsLoading(true)
    const isFullChapter = !verseId

    addDebugInfo(
      isFullChapter
        ? `Buscando: V${versionId}, L${bookId}, C${chapterId} (completo)`
        : `Buscando: V${versionId}, L${bookId}, C${chapterId}:${verseId}`,
    )

    try {
      let data
      let text
      let bookName = `Livro ${bookId}`
      let versionName = `Versão ${versionId}`

      if (isFullChapter) {
        // Buscar capítulo completo
        data = await getVersesFromChapter(chapterId)
        // Concatenar todos os versículos ou pegar o primeiro parágrafo
        if (Array.isArray(data)) {
          text =
            data
              .slice(0, 3)
              .map((v: any) => v.text)
              .join(" ") + "..." // Primeiros 3 versículos
        } else {
          text = "Texto do capítulo não disponível"
        }
      } else {
        // Buscar versículo específico
        data = await getSpecificVerse(chapterId, verseId!)
        text = data?.text || `Versículo ${chapterId}:${verseId} não encontrado`
      }

      // Tentar obter nomes dos dados da API
      if (data?.book) bookName = data.book
      if (data?.version) versionName = data.version

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

      // Adicionar nova leitura no topo da lista
      setReadings((prev) => [newReading, ...prev])

      addDebugInfo(
        isFullChapter
          ? `✅ Capítulo carregado: ${versionName} - ${bookName} ${chapterId}`
          : `✅ Versículo carregado: ${versionName} - ${bookName} ${chapterId}:${verseId}`,
      )
    } catch (error) {
      console.error("Erro ao buscar leitura bíblica:", error)

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

      setReadings((prev) => [errorReading, ...prev])
      addDebugInfo(`❌ Erro: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Exemplos de teste com versões - ESTES SÃO OS BOTÕES DE TESTE
  const testReadings = [
    {
      versionId: 1, // Versão 1 da Bíblia (ex: Almeida)
      bookId: 1, // Livro 1 (Gênesis)
      chapterId: 1, // Capítulo 1
      verseId: 1, // Versículo 1
      name: "V1 - Gn 1:1", // Nome exibido no botão
    },
    {
      versionId: 1,
      bookId: 43, // Livro 43 (João)
      chapterId: 3,
      verseId: 16,
      name: "V1 - Jo 3:16",
    },
    {
      versionId: 2, // Versão 2 da Bíblia (ex: Nova Versão)
      bookId: 19, // Livro 19 (Salmos)
      chapterId: 23,
      verseId: 1,
      name: "V2 - Sl 23:1",
    },
  ]

  const testChapters = [
    {
      versionId: 1,
      bookId: 1,
      chapterId: 1,
      name: "V1 - Gn 1", // Capítulo completo (sem verseId)
    },
    {
      versionId: 1,
      bookId: 19,
      chapterId: 23,
      name: "V1 - Sl 23", // Capítulo completo
    },
  ]

  // Escutar eventos do SignalR globalmente
  useEffect(() => {
    const handleBibleReading = (event: CustomEvent) => {
      const { versionId, bookId, chapterId, verseId, isFullChapter, apiData, error, originalData } = event.detail

      addDebugInfo(`📡 Evento: V${versionId}, L${bookId}, C${chapterId}${verseId ? `:${verseId}` : " (completo)"}`)

      if (apiData) {
        // Se já temos os dados da API, criar leitura diretamente
        const text = isFullChapter
          ? Array.isArray(apiData)
            ? apiData
                .slice(0, 3)
                .map((v: any) => v.text)
                .join(" ") + "..."
            : "Texto não disponível"
          : apiData.text || "Texto não disponível"

        const bookName = apiData.book || `Livro ${bookId}`
        const versionName = apiData.version || `Versão ${versionId}`

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
          error: false,
          originalData,
        }

        setReadings((prev) => [newReading, ...prev])
        addDebugInfo(`✅ Leitura adicionada via API`)
      } else if (error) {
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

        setReadings((prev) => [errorReading, ...prev])
        addDebugInfo(`❌ Erro no evento SignalR`)
      } else {
        // Buscar dados da API
        fetchBibleReading(versionId, bookId, chapterId, verseId, originalData)
      }
    }

    window.addEventListener("bibleReadingHighlighted", handleBibleReading as EventListener)

    return () => {
      window.removeEventListener("bibleReadingHighlighted", handleBibleReading as EventListener)
    }
  }, [])

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Leitura Bíblica</h1>
        <div className="flex gap-2 flex-wrap">
          {/* BOTÕES DE TESTE - Simulam dados que viriam do SignalR */}

          {/* Versículos específicos - Testam versículos individuais */}
          {testReadings.map((test) => (
            <Button
              key={`${test.versionId}-${test.bookId}-${test.chapterId}-${test.verseId}`}
              onClick={() => fetchBibleReading(test.versionId, test.bookId, test.chapterId, test.verseId)}
              variant="outline"
              size="sm"
              disabled={isLoading}
              title={`Testar: Versão ${test.versionId}, Livro ${test.bookId}, Capítulo ${test.chapterId}, Versículo ${test.verseId}`}
            >
              <Book className="h-4 w-4 mr-2" />
              {test.name} {/* Exemplo: "V1 - Gn 1:1" */}
            </Button>
          ))}

          {/* Capítulos completos - Testam capítulos inteiros */}
          {testChapters.map((test) => (
            <Button
              key={`${test.versionId}-${test.bookId}-${test.chapterId}`}
              onClick={() => fetchBibleReading(test.versionId, test.bookId, test.chapterId)}
              variant="secondary"
              size="sm"
              disabled={isLoading}
              title={`Testar: Versão ${test.versionId}, Livro ${test.bookId}, Capítulo ${test.chapterId} completo`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {test.name} {/* Exemplo: "V1 - Gn 1" */}
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
              <span className="text-sm font-medium text-gray-700">Debug Info</span>
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
