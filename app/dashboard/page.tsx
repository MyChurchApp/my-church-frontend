"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth-utils"
import { getChurchStats } from "@/services/church.service"
import { StatsCardsContainer } from "./containers/stats/stats-cards.container"
import { FeedSectionContainer } from "./containers/feed/feed-section.container"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    membersCount: 0,
    eventsCount: 0,
    donationsTotal: 0,
    attendanceRate: 0,
  })

  useEffect(() => {
    // Verificar autenticação
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Carregar estatísticas
    const loadStats = async () => {
      try {
        const churchStats = await getChurchStats()
        setStats(churchStats)
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [router])

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <Tabs defaultValue="visao-geral">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
        </TabsList>
        <TabsContent value="visao-geral" className="space-y-6">
          <StatsCardsContainer />
          <FeedSectionContainer />
        </TabsContent>
        <TabsContent value="atividades">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Conteúdo das atividades recentes será exibido aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
