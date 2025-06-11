"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Book, Clock, RefreshCw } from "lucide-react"
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

  // Usar o hook SignalR
  useSignalR(1)

  // Função para simular recebimento de leitura bíblica
  const simulateReading = (chapterId: number, verseId: number) => {
    setIsLoading(true)

    // Simular dados que viriam do backend
    setTimeout(() => {
      const mockData = {
        book: `Livro ${chapterId}`,
        chapter: chapterId,
        verse: verseId,
        text: `Este é o texto do versículo ${chapterId}:${verseId} que viria do backend.`,
      }

      const newReading: BibleReading = {
        id: `${chapterId}-${verseId}-${Date.now()}`,
        chapterId,
        verseId,
        text: mockData.text,
        book: mockData.book,
        chapter: mockData.chapter,
        verse: mockData.verse,
        timestamp: new Date(),
      }

      // Adicionar nova leitura no topo da lista
      setReadings((prev) => [newReading, ...prev])
      setIsLoading(false)
    }, 500)
  }

  // Escutar eventos do SignalR globalmente
  useEffect(() => {
    const handleBibleReading = (event: CustomEvent) => {
      const { ChapterId, VerseId } = event.detail
      simulateReading(ChapterId, VerseId)
    }

    window.addEventListener("bibleReadingHighlighted", handleBibleReading as EventListener)

    return () => {
      window.removeEventListener("bibleReadingHighlighted", handleBibleReading as EventListener)
    }
  }, [])

  return (
    <div className="container mx-auto p-4">
      {/* Header simples */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Leitura Bíblica</h1>
        <div className="flex gap-2">
          <Button onClick={() => simulateReading(1, 1)} variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Book className="h-4 w-4 mr-2" />}
            Simular Leitura
          </Button>
        </div>
      </div>

      {/* Status de conexão */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-gray-600">Conectado ao sistema de leitura bíblica</span>
      </div>

      {/* Lista de leituras - novos itens aparecem no topo */}
      <div className="space-y-4">
        {readings.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-gray-500">Aguardando leituras bíblicas...</p>
            </CardContent>
          </Card>
        ) : (
          readings.map((reading) => (
            <Card key={reading.id} className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">
                      {reading.book} {reading.chapter}:{reading.verse}
                    </span>
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
