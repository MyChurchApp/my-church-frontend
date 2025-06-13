"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "../../components/stats/stats-cards"
import { getUser } from "@/lib/auth-utils"
import type { User } from "@/lib/types"

export function StatsCardsContainer() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    membersCount: 0,
    eventsCount: 0,
    donationsTotal: 0,
    attendanceRate: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // Obter dados do usuário
        const userData = getUser()
        setUser(userData)

        // Aqui você pode fazer chamadas para a API real para obter estatísticas
        // Por enquanto, vamos usar dados fictícios
        setStats({
          membersCount: 120,
          eventsCount: 8,
          donationsTotal: 5200,
          attendanceRate: 78,
        })
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <StatsCards
      isLoading={isLoading}
      membersCount={stats.membersCount}
      eventsCount={stats.eventsCount}
      donationsTotal={stats.donationsTotal}
      attendanceRate={stats.attendanceRate}
    />
  )
}
