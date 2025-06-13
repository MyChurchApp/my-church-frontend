"use client"

import { useEffect, useState } from "react"
import { FeedSection } from "@/app/dashboard/components/feed/feed-section"
import { authFetch } from "@/lib/auth-fetch"

interface FeedItem {
  id: string
  type: "donation" | "event" | "member" | "announcement"
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
  amount?: number
}

export function FeedSectionContainer() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        // Substitua pela URL real da sua API
        const response = await authFetch("/api/feed")
        if (response.ok) {
          const data = await response.json()
          setFeedItems(data.items || [])
        }
      } catch (error) {
        console.error("Erro ao buscar dados do feed:", error)
        // Em caso de erro, mantém array vazio
        setFeedItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeedData()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return <FeedSection items={feedItems} />
}
