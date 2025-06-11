"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Book, Clock, Bug, BookOpen, AlertCircle, RefreshCw } from "lucide-react"
import { useSignalR } from "../useSignalR"
import { getSpecificVerse, getVersesFromChapter } from "@/lib/bible-api"

interface BibleReading {
  id: string
  bookId: number
  chapterId: number
  verseId?: number
  text: string
  book: string
  chapter: number
  verse?: number
  timestamp: Date
  isFullChapter: boolean
  error?: boolean
}

export default function LeituraBiblicaPage() {
  const [readings, setReadings] = useState<BibleReading[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Usar o hook SignalR
  useSignalR(1)

  // Função para adicionar info de debug
  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [`${new Date().toLocaleTimeString()}: ${info}`, ...prev.slice(0, 4)])
  }

  // Função para buscar leitura bíblica da API real
  const fetchBibleReading = async (bookId: number, chapterId: number, verseId?: number) => {
    setIsLoading(true)
    const isFullChapter = !verseId

    addDebugInfo(
      isFullChapter
        ? `Buscando capítulo: Livro ${bookId}, Capítulo ${chapterId}`
        : `Buscando versículo: Livro ${bookId}, Capítulo ${chapterId}, Versículo ${verseId}`,
    )

    try {
      let data
      let text
      let bookName = `Livro ${bookId}`

      if (isFullChapter) {
        // Buscar capítulo completo
        data = await getVersesFromChapter(chapterId)
        // Concatenar todos os versículos ou pegar o primeiro parágrafo
        text = Array.isArray(data) ? data.map((v: any) => v.text).join(" ") : "Texto do capítulo não disponível"
      } else {
        // Buscar versículo específico
        data = await getSpecificVerse(chapterId, verseId!)
        text = data?.text || `Versículo ${chapterId}:${verseId} não encontrado`

        // Tentar obter o nome do livro se disponível na API
        if (data?.book) {
          bookName = data.book
        }
      }

      const newReading: BibleReading = {
        id: `${bookId}-${chapterId}-${verseId || "full"}-${Date.now()}`,
        bookId,
        chapterId,
        verseId,
        text,
        book: bookName,
        chapter: chapterId,
        verse: verseId,
        timestamp: new Date(),
        isFullChapter,
      }

      // Adicionar nova leitura no topo da lista
      setReadings((prev) => [newReading, ...prev])

      addDebugInfo(
        isFullChapter
          ? `Capítulo carregado: ${bookName} ${chapterId}`
          : `Versículo carregado: ${bookName} ${chapterId}:${verseId}`,
      )
    } catch (error) {
      console.error("Erro ao buscar leitura bíblica:", error)

      // Criar leitura com erro
      const errorReading: BibleReading = {
        id: `error-${bookId}-${chapterId}-${verseId || "full"}-${Date.now()}`,
        bookId,
        chapterId,
        verseId,
        text: "Erro ao carregar o texto bíblico. Verifique sua conexão ou autenticação.",
        book: `Livro ${bookId}`,
        chapter: chapterId,
        verse: verseId,
        timestamp: new Date(),
        isFullChapter,
        error: true,
      }

      setReadings((prev) => [errorReading, ...prev])
      addDebugInfo(`❌ Erro ao carregar texto bíblico: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Exemplos de teste
  const testReadings = [
    { bookId: 1, chapterId: 1, verseId: 1, name: "Gn 1:1" },
    { bookId: 43, chapterId: 3, verseId: 16, name: "Jo 3:16" },
    { bookId: 19, chapterId: 23, verseId: 1, name: "Sl 23:1" },
  ]

  const testChapters = [
    { bookId: 1, chapterId: 1, name: "Gn 1" },
    { bookId: 19, chapterId: 23, name: "Sl 23" },
  ]

  // Escutar eventos do SignalR globalmente
  useEffect(() => {
    const handleBibleReading = (event: CustomEvent) => {
      const { bookId, chapterId, verseId, isFullChapter, apiData, error } = event.detail

      addDebugInfo(
        `Evento recebido: Livro ${bookId}, Capítulo ${chapterId}${verseId ? `, Versículo ${verseId}` : " (completo)"}`,
      )

      if (apiData) {
        // Se já temos os dados da API, criar leitura diretamente
        const text = isFullChapter
          ? Array.isArray(apiData)
            ? apiData.map((v: any) => v.text).join(" ")
            : "Texto não disponível"
          : apiData.text || "Texto não disponível"

        const bookName = apiData.book || `Livro ${bookId}`

        const newReading: BibleReading = {
          id: `${bookId}-${chapterId}-${verseId || "full"}-${Date.now()}`,
          bookId,
          chapterId,
          verseId,
          text,
          book: bookName,
          chapter: chapterId,
          verse: verseId,
          timestamp: new Date(),
          isFullChapter,
          error: false,
        }

        setReadings((prev) => [newReading, ...prev])
        addDebugInfo(`Leitura adicionada com dados da API`)
      } else if (error) {
        // Se houve erro, criar leitura de erro
        const errorReading: BibleReading = {
          id: `error-${bookId}-${chapterId}-${verseId || "full"}-${Date.now()}`,
          bookId,
          chapterId,
          verseId,
          text: "Erro ao carregar o texto bíblico. Verifique sua conexão ou autenticação.",
          book: `Livro ${bookId}`,
          chapter: chapterId,
          verse: verseId,
          timestamp: new Date(),
          isFullChapter,
          error: true,
        }

        setReadings((prev) => [errorReading, ...prev])
        addDebugInfo(`❌ Erro ao processar evento de leitura bíblica`)
      } else {
        // Buscar dados da API
        fetchBibleReading(bookId, chapterId, verseId)
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
          {/* Versículos específicos */}
          {testReadings.map((test) => (
            <Button
              key={`${test.bookId}-${test.chapterId}-${test.verseId}`}
              onClick={() => fetchBibleReading(test.bookId, test.chapterId, test.verseId)}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <Book className="h-4 w-4 mr-2" />
              {test.name}
            </Button>
          ))}

          {/* Capítulos completos */}
          {testChapters.map((test) => (
            <Button
              key={`${test.bookId}-${test.chapterId}`}
              onClick={() => fetchBibleReading(test.bookId, test.chapterId)}
              variant="secondary"
              size="sm"
              disabled={isLoading}
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
                      {reading.book} {reading.chapter}
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
