"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Trash2 } from "lucide-react"
import type { CashFlowItem } from "@/services/financeiro.service"

interface TransactionCardProps {
  transaction: CashFlowItem
  formatCurrency: (value: number) => string
  formatDate: (date: string) => string
  getCategoryColor: (categoryName: string) => string
  getCashFlowTypeText: (type: number) => string
  onDelete: (id: string) => void
}

export function TransactionCard({
  transaction,
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCashFlowTypeText,
  onDelete,
}: TransactionCardProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border border-gray-100 rounded-lg gap-3 md:gap-4">
      <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1">
        <div className={`p-2 rounded-full flex-shrink-0 ${transaction.type === 0 ? "bg-green-100" : "bg-red-100"}`}>
          {transaction.type === 0 ? (
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm md:text-base truncate">{transaction.description}</h4>
          <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
            <Badge className={`${getCategoryColor(transaction.categoryName)} text-xs`}>
              {transaction.categoryName}
            </Badge>
            {transaction.memberName && (
              <span className="text-xs md:text-sm text-gray-500">• {transaction.memberName}</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1 md:hidden">{formatDate(transaction.date)}</div>
        </div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-2 md:gap-2">
        <div className="text-left md:text-right">
          <div
            className={`text-base md:text-lg font-bold ${transaction.type === 0 ? "text-green-600" : "text-red-600"}`}
          >
            {transaction.type === 0 ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </div>
          <div className="text-xs md:text-sm text-gray-500 hidden md:block">{formatDate(transaction.date)}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(transaction.id.toString())}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 md:p-2"
        >
          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </div>
    </div>
  )
}
