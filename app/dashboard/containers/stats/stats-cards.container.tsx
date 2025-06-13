"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "../../components/stats/stats-cards"
import { getChurchStats } from "@/services/church.service"

export function StatsCardsContainer() {
  const [stats, setStats] = useState({
    membersCount: 0,
    eventsCount: 0,
    donationsTotal: 0,
    attendanceRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const churchStats = await getChurchStats()
        setStats(churchStats)
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return <StatsCards stats={stats} loading={loading} />
}
