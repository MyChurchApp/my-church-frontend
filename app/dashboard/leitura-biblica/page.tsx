"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Book, Clock, RefreshCw, Bug } from "lucide-react"
import { useSignalR } from "../useSignalR"

interface BibleReading {
  id: string
  chapterId: number
  verseId: number
  text: string
  book: string
  chapter: number
  verse: number
  timestamp: Date
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

  // Função para simular recebimento de leitura bíblica
  const simulateReading = (chapterId: number, verseId: number) => {
    setIsLoading(true)
    addDebugInfo(`Simulando leitura: Capítulo ${chapterId}, Versículo ${verseId}`)

    // Dados mock mais realistas
    const mockBooks = {
      1: "Gênesis",
      2: "João",
      3: "Salmos",
      4: "Filipenses",
      5: "Romanos",
    }

    const mockTexts = {
      "1-1": "No princípio criou Deus os céus e a terra.",
      "2-1": "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito...",
      "3-1": "O Senhor é o meu pastor, nada me faltará.",
      "4-1": "Posso todas as coisas em Cristo que me fortalece.",
      "5-1": "E sabemos que todas as coisas contribuem juntamente para o bem...",
    }

    setTimeout(() => {
      const bookName = mockBooks[chapterId as keyof typeof mockBooks] || `Livro ${chapterId}`
      const text =
        mockTexts[`${chapterId}-${verseId}` as keyof typeof mockTexts] ||
        `Texto do versículo ${chapterId}:${verseId} que viria do backend.`

      const newReading: BibleReading = {
        id: `${chapterId}-${verseId}-${Date.now()}`,
        chapterId,
        verseId,
        text,
        book: bookName,
        chapter: chapterId,
        verse: verseId,
        timestamp: new Date(),
      }

      // Adicionar nova leitura no topo da lista
      setReadings((prev) => [newReading, ...prev])
      setIsLoading(false)
      addDebugInfo(`Leitura adicionada: ${bookName} ${chapterId}:${verseId}`)
    }, 500)
  }

  // Escutar eventos do SignalR globalmente
  useEffect(() => {
    const handleBibleReading = (event: CustomEvent) => {
      const { ChapterId, VerseId } = event.detail
      addDebugInfo(`Evento SignalR recebido: Capítulo ${ChapterId}, Versículo ${VerseId}`)
      simulateReading(ChapterId, VerseId)
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
        <div className="flex gap-2">
          <Button onClick={() => simulateReading(1, 1)} variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Book className="h-4 w-4 mr-2" />}
            Gênesis 1:1
          </Button>
          <Button onClick={() => simulateReading(2, 1)} variant="outline" size="sm" disabled={isLoading}>
            <Book className="h-4 w-4 mr-2" />
            João 3:16
          </Button>
          <Button onClick={() => simulateReading(3, 1)} variant="outline" size="sm" disabled={isLoading}>
            <Book className="h-4 w-4 mr-2" />
            Salmos 23:1
          </Button>
        </div>
      </div>

      {/* Status de conexão */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-gray-600">Conectado ao sistema de leitura bíblica</span>
      </div>

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
        {readings.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <Book className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aguardando leituras bíblicas...</p>
              <p className="text-xs text-gray-400 mt-1">Use os botões acima para testar</p>
            </CardContent>
          </Card>
        ) : (
          readings.map((reading, index) => (
            <Card key={reading.id} className={`mb-4 ${index === 0 ? "ring-2 ring-blue-200" : ""}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">
                      {reading.book} {reading.chapter}:{reading.verse}
                    </span>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Mais recente
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {reading.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
                <p className="text-gray-700 border-l-2 border-blue-200 pl-3 italic">"{reading.text}"</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
