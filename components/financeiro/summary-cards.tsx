"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react"

interface SummaryCardsProps {
  totalEntradas: number
  totalSaidas: number
  saldo: number
  totalTransacoes: number
  formatCurrency: (value: number) => string
}

export function SummaryCards({
  totalEntradas = 0,
  totalSaidas = 0,
  saldo = 0,
  totalTransacoes = 0,
  formatCurrency,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Total Entradas</CardTitle>
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-lg md:text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</div>
          <p className="text-xs text-muted-foreground hidden md:block">Dízimos, ofertas e doações</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Total Saídas</CardTitle>
          <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-lg md:text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</div>
          <p className="text-xs text-muted-foreground hidden md:block">Despesas e salários</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Saldo</CardTitle>
          <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className={`text-lg md:text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(saldo)}
          </div>
          <p className="text-xs text-muted-foreground hidden md:block">Entradas - Saídas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Transações</CardTitle>
          <Receipt className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-lg md:text-2xl font-bold">{totalTransacoes}</div>
          <p className="text-xs text-muted-foreground hidden md:block">Total de registros</p>
        </CardContent>
      </Card>
    </div>
  )
}
