"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, DollarSign, ChevronRight, Bell, FileText } from "lucide-react"
import { FeedSectionContainer } from "./containers/feed/feed-section.container"
import { StatsCardsContainer } from "./containers/stats/stats-cards.container"
import { isAuthenticated } from "@/lib/auth-utils"
import type { User } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se está autenticado
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Obter dados do usuário do localStorage
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser({
          id: parsedUser.id || "1",
          name: parsedUser.name || "Usuário",
          email: parsedUser.email || "",
          role: parsedUser.role || "Membro",
          accessLevel: parsedUser.accessLevel || "member",
        })
      } else {
        // Fallback para dados básicos
        setUser({
          id: "1",
          name: "Usuário",
          email: "",
          role: "Membro",
          accessLevel: "member",
        })
      }
    } catch (error) {
      console.error("Erro ao obter dados do usuário:", error)
      // Fallback para dados básicos
      setUser({
        id: "1",
        name: "Usuário",
        email: "",
        role: "Membro",
        accessLevel: "member",
      })
    } finally {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo de volta, {user?.name || "Usuário"}!</p>
      </div>

      {/* Stats Cards */}
      <StatsCardsContainer />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => router.push("/dashboard/eventos")}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>Gerenciar Eventos</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => router.push("/dashboard/membros")}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <span>Gerenciar Membros</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => router.push("/dashboard/financeiro")}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span>Gerenciar Finanças</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => router.push("/dashboard/comunicacao")}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                  <span>Comunicação</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feed Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Feed da Igreja</h2>
        <FeedSectionContainer user={user} />
      </div>

      {/* Recent Reports */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Relatórios Recentes</h2>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/relatorios")}>
            Ver todos
          </Button>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum relatório recente</h3>
          <p className="text-gray-600 mb-4">Gere relatórios para visualizar informações detalhadas</p>
          <Button onClick={() => router.push("/dashboard/relatorios")}>Gerar Relatório</Button>
        </div>
      </div>
    </div>
  )
}
