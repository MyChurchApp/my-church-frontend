"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [currentReading, setCurrentReading] = useState<BibleReading | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Usar o hook SignalR
  useSignalR(1)

  // Função para buscar leitura bíblica
  const fetchBibleReading = async (chapterId: number, verseId: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/bible/chapters/${chapterId}/verses/${verseId}`)
      const data = await res.json()

      const newReading: BibleReading = {
        id: `${chapterId}-${verseId}-${Date.now()}`,
        chapterId,
        verseId,
        text: data.text || "Texto não encontrado",
        book: data.book || "Livro",
        chapter: data.chapter || chapterId,
        verse: data.verse || verseId,
        timestamp: new Date(),
      }

      setCurrentReading(newReading)
      setReadings((prev) => [newReading, ...prev.slice(0, 9)]) // Manter apenas 10 leituras
    } catch (error) {
      console.error("Erro ao buscar leitura bíblica:", error)
      const errorReading: BibleReading = {
        id: `error-${Date.now()}`,
        chapterId,
        verseId,
        text: "Erro ao carregar o versículo",
        book: "Erro",
        chapter: chapterId,
        verse: verseId,
        timestamp: new Date(),
      }
      setCurrentReading(errorReading)
    } finally {
      setIsLoading(false)
    }
  }

  // Simular uma leitura para teste
  const handleTestReading = () => {
    fetchBibleReading(1, 1) // João 3:16 como exemplo
  }

  // Escutar eventos do SignalR globalmente
  useEffect(() => {
    const handleBibleReading = (event: CustomEvent) => {
      const { ChapterId, VerseId } = event.detail
      fetchBibleReading(ChapterId, VerseId)
    }

    window.addEventListener("bibleReadingHighlighted", handleBibleReading as EventListener)

    return () => {
      window.removeEventListener("bibleReadingHighlighted", handleBibleReading as EventListener)
    }
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leitura Bíblica</h1>
          <p className="text-gray-600 mt-2">Acompanhe as leituras bíblicas destacadas durante o culto</p>
        </div>
        <Button onClick={handleTestReading} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Teste de Leitura
        </Button>
      </div>

      {/* Leitura Atual */}
      {currentReading && (
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-teal-600" />
                Leitura Atual
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {currentReading.timestamp.toLocaleTimeString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{currentReading.book}</span>
                <span>
                  {currentReading.chapter}:{currentReading.verse}
                </span>
              </div>
              <blockquote className="text-lg leading-relaxed border-l-4 border-teal-200 pl-4 italic">
                "{currentReading.text}"
              </blockquote>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status de Conexão */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Conectado ao sistema de leitura bíblica</span>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Leituras */}
      {readings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Histórico de Leituras</h2>
          <div className="grid gap-4">
            {readings.map((reading) => (
              <Card key={reading.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Book className="h-4 w-4" />
                        <span className="font-medium">{reading.book}</span>
                        <span>
                          {reading.chapter}:{reading.verse}
                        </span>
                      </div>
                      <p className="text-gray-800 leading-relaxed">"{reading.text}"</p>
                    </div>
                    <Badge variant="outline" className="ml-4 flex-shrink-0">
                      {reading.timestamp.toLocaleTimeString()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {readings.length === 0 && !currentReading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aguardando Leituras Bíblicas</h3>
              <p className="text-gray-600 mb-4">As leituras aparecerão aqui quando forem destacadas durante o culto</p>
              <Button onClick={handleTestReading} variant="outline">
                Testar Leitura
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
