"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Receipt, Grid3X3, Table, PiggyBank } from "lucide-react"
import { TransactionCard } from "./transaction-card"
import { TransactionsTable } from "./transactions-table"
import type { CashFlowItem } from "@/services/financeiro.service"

interface TransactionsListProps {
  transactions: CashFlowItem[]
  viewMode: "cards" | "table"
  formatCurrency: (value: number) => string
  formatDate: (date: string) => string
  getCategoryColor: (categoryName: string) => string
  getCashFlowTypeText: (type: number) => string
  getMethodIcon: (method: string) => string
  onViewModeChange: (mode: "cards" | "table") => void
  onDelete: (id: string) => void
}

export function TransactionsList({
  transactions = [], // Default para array vazio
  viewMode,
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCashFlowTypeText,
  getMethodIcon,
  onViewModeChange,
  onDelete,
}: TransactionsListProps) {
  // Garantir que transactions é sempre um array
  const safeTransactions = Array.isArray(transactions) ? transactions : []

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Receipt className="h-4 w-4 md:h-5 md:w-5" />
            Histórico de Transações
          </CardTitle>
          <div className="flex border rounded-md">
            <Button
              onClick={() => onViewModeChange("cards")}
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none px-2 md:px-3"
            >
              <Grid3X3 className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <Button
              onClick={() => onViewModeChange("table")}
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none px-2 md:px-3"
            >
              <Table className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {safeTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PiggyBank className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm md:text-base">Nenhuma transação encontrada</p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="space-y-3 md:space-y-4">
            {safeTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getCategoryColor={getCategoryColor}
                getCashFlowTypeText={getCashFlowTypeText}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <TransactionsTable
            transactions={safeTransactions}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getCategoryColor={getCategoryColor}
            getCashFlowTypeText={getCashFlowTypeText}
            onDelete={onDelete}
          />
        )}
      </CardContent>
    </Card>
  )
}
