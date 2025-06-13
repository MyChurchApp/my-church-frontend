"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeEvents: 0,
    monthlyDonations: 0,
    growth: 0,
  })

  useEffect(() => {
    // Por enquanto, deixar os stats zerados até conectar com a API real
    setStats({
      totalMembers: 0,
      activeEvents: 0,
      monthlyDonations: 0,
      growth: 0,
    })
  }, [])

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral da sua igreja</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Membros cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Eventos este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.monthlyDonations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total arrecadado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.growth}%</div>
            <p className="text-xs text-muted-foreground">Comparado ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao MyChurch</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Sistema de gestão eclesiástica completo para sua igreja. Use o menu lateral para navegar pelas diferentes
            funcionalidades.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
