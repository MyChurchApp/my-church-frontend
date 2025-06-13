"use client"

import { useState, useEffect } from "react"
import { FeedSection } from "../../components/feed/feed-section"

// Interface para os itens do feed
interface FeedItem {
  id: number
  type: "event" | "donation" | "member" | "announcement"
  title: string
  description: string
  date: string
  icon?: string
}

export function FeedSectionContainer() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeedItems = async () => {
      try {
        setLoading(true)

        // Em uma implementação real, você buscaria os dados da API
        // const response = await fetch('/api/feed');
        // const data = await response.json();
        // setFeedItems(data);

        // Por enquanto, vamos usar dados simulados
        const mockFeedItems: FeedItem[] = [
          {
            id: 1,
            type: "event",
            title: "Culto de Domingo",
            description: "O culto de domingo foi agendado para às 10h",
            date: "2025-06-13T10:00:00",
          },
          {
            id: 2,
            type: "donation",
            title: "Nova doação recebida",
            description: "Uma doação de R$ 100,00 foi recebida",
            date: "2025-06-12T15:30:00",
          },
          {
            id: 3,
            type: "member",
            title: "Novo membro",
            description: "João Silva se juntou à igreja",
            date: "2025-06-11T09:15:00",
          },
          {
            id: 4,
            type: "announcement",
            title: "Reunião de líderes",
            description: "Reunião de líderes marcada para quarta-feira às 19h",
            date: "2025-06-10T19:00:00",
          },
        ]

        setFeedItems(mockFeedItems)
      } catch (error) {
        console.error("Erro ao carregar itens do feed:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeedItems()
  }, [])

  return <FeedSection feedItems={feedItems} loading={loading} />
}
