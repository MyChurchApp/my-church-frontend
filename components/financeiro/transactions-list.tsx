"use client"
import { Button } from "@/components/ui/button"

interface CashFlowItem {
  id: string
  date: string
  description: string
  category: string
  method: string
  value: number
  type: number
  amount: number
}

interface TransactionsListProps {
  transactions: CashFlowItem[]
  viewMode: "cards" | "table"
  formatCurrency: (value: number) => string
  formatDate: (dateString: string) => string
  getCategoryColor: (categoryName: string) => string
  getCashFlowTypeText: (type: number) => string
  getMethodIcon: (method: string) => string
  onViewModeChange: (mode: "cards" | "table") => void
  onEdit: (transaction: CashFlowItem) => void
  onDelete: (recordId: string) => void
}

export function TransactionsList({
  transactions,
  viewMode,
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCashFlowTypeText,
  getMethodIcon,
  onViewModeChange,
  onEdit,
  onDelete,
}: TransactionsListProps) {
  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">{formatDate(transaction.date)}</div>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getCategoryColor(transaction.category) }}
              ></div>
            </div>
            <div className="text-lg font-semibold">{transaction.description}</div>
            <div className="text-gray-500">{transaction.category}</div>
            <div className="flex items-center mt-2">
              {getMethodIcon(transaction.method)}
              <span className="ml-1 text-sm">{transaction.method}</span>
            </div>
            <div className="mt-2 font-bold">{formatCurrency(transaction.amount)}</div>
            <div className="text-sm text-gray-600">{getCashFlowTypeText(transaction.type)}</div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(transaction)}
                className="text-blue-600 hover:text-blue-700"
              >
                ✏️ Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(transaction.id)}
                className="text-red-600 hover:text-red-700"
              >
                🗑️ Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descrição
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoria
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Método
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(transaction.date)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{transaction.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{transaction.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{transaction.method}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatCurrency(transaction.amount)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {getCashFlowTypeText(transaction.type)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(transaction)}
                  className="text-blue-600 hover:text-blue-700 mr-2"
                >
                  ✏️
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(transaction.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
