"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react"
import type { ChurchData } from "@/lib/fake-api"

interface StatsCardsProps {
  churchData: ChurchData
}

export function StatsCards({ churchData }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Total de Membros</CardTitle>
          <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold">{churchData.members || "..."}</div>
          <p className="text-xs text-muted-foreground">
            {churchData.newMembers > 0 ? `+${churchData.newMembers} este mês` : "Sem novos membros"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Eventos este Mês</CardTitle>
          <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold">{churchData.events?.monthly || "0"}</div>
          <p className="text-xs text-muted-foreground">
            {churchData.events?.weeklyChange > 0
              ? `+${churchData.events?.weeklyChange} da semana passada`
              : churchData.events?.weeklyChange < 0
                ? `${churchData.events?.weeklyChange} da semana passada`
                : "Mesmo número da semana passada"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Dízimos e Ofertas</CardTitle>
          <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold">
            {churchData.finances?.total
              ? `R$ ${churchData.finances.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "R$ 0,00"}
          </div>
          <p className="text-xs text-muted-foreground">
            {churchData.finances?.monthlyChange > 0
              ? `+${churchData.finances.monthlyChange}% vs mês anterior`
              : churchData.finances?.monthlyChange < 0
                ? `${churchData.finances.monthlyChange}% vs mês anterior`
                : "Mesmo valor do mês anterior"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Crescimento</CardTitle>
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold">{churchData.growth ? `+${churchData.growth}%` : "0%"}</div>
          <p className="text-xs text-muted-foreground">Últimos 3 meses</p>
        </CardContent>
      </Card>
    </div>
  )
}
