"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Trash2 } from "lucide-react"
import type { CashFlowItem } from "@/services/financeiro.service"

interface TransactionsTableProps {
  transactions: CashFlowItem[]
  formatCurrency: (value: number) => string
  formatDate: (date: string) => string
  getCategoryColor: (categoryName: string) => string
  getCashFlowTypeText: (type: number) => string
  onDelete: (id: string) => void
}

export function TransactionsTable({
  transactions = [], // Default para array vazio
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCashFlowTypeText,
  onDelete,
}: TransactionsTableProps) {
  // Garantir que transactions é sempre um array
  const safeTransactions = Array.isArray(transactions) ? transactions : []

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left p-3 font-semibold text-gray-700">Tipo</th>
            <th className="text-left p-3 font-semibold text-gray-700">Descrição</th>
            <th className="text-left p-3 font-semibold text-gray-700">Categoria</th>
            <th className="text-left p-3 font-semibold text-gray-700">Valor</th>
            <th className="text-left p-3 font-semibold text-gray-700">Data</th>
            <th className="text-left p-3 font-semibold text-gray-700">Membro</th>
            <th className="text-center p-3 font-semibold text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {safeTransactions.map((transaction, index) => (
            <tr
              key={transaction.id}
              className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
            >
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-full ${transaction.type === 0 ? "bg-green-100" : "bg-red-100"}`}>
                    {transaction.type === 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium capitalize">{getCashFlowTypeText(transaction.type)}</span>
                </div>
              </td>
              <td className="p-3">
                <span className="text-sm font-medium">{transaction.description}</span>
              </td>
              <td className="p-3">
                <Badge className={`${getCategoryColor(transaction.categoryName)} text-xs`}>
                  {transaction.categoryName}
                </Badge>
              </td>
              <td className="p-3">
                <span className={`text-sm font-bold ${transaction.type === 0 ? "text-green-600" : "text-red-600"}`}>
                  {transaction.type === 0 ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </td>
              <td className="p-3">
                <span className="text-sm text-gray-600">{formatDate(transaction.date)}</span>
              </td>
              <td className="p-3">
                <span className="text-sm text-gray-600">{transaction.memberName || "-"}</span>
              </td>
              <td className="p-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(transaction.id.toString())}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
