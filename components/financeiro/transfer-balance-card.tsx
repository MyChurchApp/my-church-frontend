"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, RefreshCw } from "lucide-react"
import { DonationTransferService } from "@/services/donation-transfer.service"

interface TransferBalanceCardProps {
  onRefresh?: () => void
}

export function TransferBalanceCard({ onRefresh }: TransferBalanceCardProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBalance = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // A API retorna o valor direto (ex: 564.33)
      const balance = await DonationTransferService.getTransferBalance()
      setBalance(balance)
    } catch (error) {
      console.error("Erro ao carregar saldo:", error)
      setError("Ops, tente mais tarde")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBalance()
  }, [])

  const handleRefresh = () => {
    loadBalance()
    onRefresh?.()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            {isLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">Carregando...</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {balance !== null ? formatCurrency(balance) : "R$ 0,00"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Valor disponível para transferência</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
