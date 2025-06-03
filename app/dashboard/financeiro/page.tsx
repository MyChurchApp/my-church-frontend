"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Componentes burros
import { PageHeader } from "@/components/financeiro/page-header"
import { SummaryCards } from "@/components/financeiro/summary-cards"
import { FiltersBar } from "@/components/financeiro/filters-bar"
import { TransactionsList } from "@/components/financeiro/transactions-list"
import { NewTransactionModal } from "@/components/financeiro/new-transaction-modal"
import { CategoriesModal } from "@/components/financeiro/categories-modal"

// Services
import {
  getCashFlowList,
  getCashFlowCategories,
  createCashFlow,
  createCashFlowCategory,
  deleteCashFlow,
  formatCurrency,
  formatDate,
  formatDateToISO,
  getCashFlowTypeText,
  getCashFlowTypeNumber,
  type CashFlowItem,
  type CashFlowCategory,
  type CreateCashFlowRequest,
} from "@/services/financeiro.service"

export default function FinanceiroPage() {
  const router = useRouter()

  // Estados com valores padrão seguros
  const [financeRecords, setFinanceRecords] = useState<CashFlowItem[]>([])
  const [financeCategories, setFinanceCategories] = useState<CashFlowCategory[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Estados dos modais
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)

  // Estados dos filtros
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStartDate, setFilterStartDate] = useState<string>("")
  const [filterEndDate, setFilterEndDate] = useState<string>("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  // ✅ Função de teste de autenticação CORRIGIDA com "Bearer "
  const handleTestAuth = async () => {
    console.log("🧪 Testando autenticação...")

    const token = localStorage.getItem("authToken")
    if (!token) {
      alert("❌ Token não encontrado no localStorage!")
      return
    }

    console.log(`🔑 Token encontrado: ${token.substring(0, 20)}...`)

    try {
      // ✅ CORRIGIDO: Agora usa "Bearer " (com espaço) antes do token
      const response = await fetch("https://demoapp.top1soft.com.br/api/CashFlow", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ ESPAÇO APÓS "Bearer"
          "Content-Type": "application/json",
          Accept: "text/plain",
        },
      })

      console.log(`📊 Status da resposta: ${response.status}`)

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        console.log(`📄 Content-Type: ${contentType}`)

        let data
        if (contentType && contentType.includes("application/json")) {
          data = await response.json()
        } else {
          const text = await response.text()
          try {
            data = JSON.parse(text)
          } catch {
            data = text
          }
        }

        console.log("✅ Resposta completa das transações:", data)

        // ✅ CORRIGIDO: Verificar estrutura { result: {...}, balance: number }
        const count =
          data && data.result && data.result.items && Array.isArray(data.result.items)
            ? data.result.items.length
            : "N/A"
        const total = data && data.result && data.result.totalCount ? data.result.totalCount : "N/A"
        const balance = data && data.balance ? data.balance : "N/A"
        alert(`✅ Sucesso! ${count} transações carregadas (${total} no total)\n💰 Saldo: R$ ${balance}`)
      } else {
        const errorText = await response.text()
        console.error("❌ Erro:", errorText)
        alert(`❌ Erro ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error("❌ Erro na requisição:", error)
      alert(`❌ Erro: ${error.message}`)
    }
  }

  // ✅ Função para testar listagem com filtros
  const handleTestCashFlowList = async () => {
    console.log("🧪 Testando listagem de transações...")

    try {
      // Testar sem filtros
      console.log("📋 Testando sem filtros...")
      const allTransactions = await getCashFlowList()
      console.log("✅ Todas as transações:", allTransactions)

      // Testar com filtros
      console.log("📋 Testando com filtros...")
      const filteredTransactions = await getCashFlowList({
        pageNumber: 1,
        pageSize: 10,
        type: 0, // Apenas entradas
      })
      console.log("✅ Transações filtradas:", filteredTransactions)

      alert(`✅ Teste concluído! Verifique o console para detalhes.`)
    } catch (error) {
      console.error("❌ Erro no teste:", error)
      alert(`❌ Erro no teste: ${error.message}`)
    }
  }

  // ✅ Carregar dados iniciais CORRIGIDO para nova estrutura da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError("")

        console.log("🔄 Iniciando carregamento de dados...")

        // ✅ CORRIGIDO: Agora getCashFlowList retorna { transactions, balance }
        const [cashFlowResponse, categoriesResponse] = await Promise.allSettled([
          getCashFlowList({ pageNumber: 1, pageSize: 100 }),
          getCashFlowCategories(),
        ])

        console.log("📊 Respostas recebidas:", {
          cashFlow: cashFlowResponse,
          categories: categoriesResponse,
        })

        // ✅ CORRIGIDO: Processar resposta que inclui transactions e balance
        if (cashFlowResponse.status === "fulfilled" && cashFlowResponse.value) {
          const { transactions, balance: apiBalance } = cashFlowResponse.value

          if (transactions?.items && Array.isArray(transactions.items)) {
            setFinanceRecords(transactions.items)
            console.log("✅ Registros carregados:", transactions.items.length)
          } else {
            setFinanceRecords([])
            console.log("⚠️ Nenhum registro encontrado")
          }

          // ✅ CORRIGIDO: Usar o saldo que vem da listagem
          if (typeof apiBalance === "number") {
            setBalance(apiBalance)
            console.log("✅ Saldo carregado:", apiBalance)
          } else {
            setBalance(0)
            console.log("⚠️ Saldo não encontrado, usando 0")
          }
        } else {
          console.log("⚠️ Erro ao carregar transações")
          setFinanceRecords([])
          setBalance(0)
        }

        // Processar categorias
        if (categoriesResponse.status === "fulfilled" && categoriesResponse.value) {
          const cats = categoriesResponse.value
          setFinanceCategories(Array.isArray(cats) ? cats : [])
          console.log("✅ Categorias carregadas:", cats.length)
        } else {
          console.log("⚠️ Nenhuma categoria encontrada")
          setFinanceCategories([])
        }
      } catch (err) {
        console.error("❌ Erro ao carregar dados:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar dados")
        // Garantir arrays vazios em caso de erro
        setFinanceRecords([])
        setFinanceCategories([])
        setBalance(0)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // ✅ Funções de manipulação CORRIGIDAS para nova estrutura
  const handleCreateTransaction = async (data: {
    type: string
    categoryId: string
    description: string
    amount: string
    date: string
  }) => {
    try {
      const recordData: CreateCashFlowRequest = {
        amount: Number.parseFloat(data.amount),
        date: formatDateToISO(new Date(data.date)),
        description: data.description,
        type: getCashFlowTypeNumber(data.type),
        categoryId: Number.parseInt(data.categoryId),
      }

      await createCashFlow(recordData)

      // ✅ CORRIGIDO: Recarregar dados usando nova estrutura
      const cashFlowResponse = await getCashFlowList({ pageNumber: 1, pageSize: 100 })

      if (cashFlowResponse.transactions?.items) {
        setFinanceRecords(cashFlowResponse.transactions.items)
      }

      if (typeof cashFlowResponse.balance === "number") {
        setBalance(cashFlowResponse.balance)
      }

      setIsTransactionModalOpen(false)
    } catch (err) {
      console.error("Erro ao criar transação:", err)
      setError(err instanceof Error ? err.message : "Erro ao criar transação")
    }
  }

  const handleCreateCategory = async (data: { name: string; description: string }) => {
    try {
      console.log("📝 Criando categoria:", data)

      // Validar dados
      if (!data.name.trim()) {
        throw new Error("Nome da categoria é obrigatório")
      }

      await createCashFlowCategory(data)
      console.log("✅ Categoria criada com sucesso!")

      // Recarregar categorias
      const categoriesResponse = await getCashFlowCategories()
      setFinanceCategories(Array.isArray(categoriesResponse) ? categoriesResponse : [])
      setIsCategoryModalOpen(false)
    } catch (err) {
      console.error("❌ Erro ao criar categoria:", err)
      setError(err instanceof Error ? err.message : "Erro ao criar categoria")
    }
  }

  const handleDeleteTransaction = (recordId: string) => {
    setRecordToDelete(recordId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteTransaction = async () => {
    if (recordToDelete) {
      try {
        await deleteCashFlow(Number.parseInt(recordToDelete))

        // ✅ CORRIGIDO: Recarregar dados usando nova estrutura
        const cashFlowResponse = await getCashFlowList({ pageNumber: 1, pageSize: 100 })

        if (cashFlowResponse.transactions?.items) {
          setFinanceRecords(cashFlowResponse.transactions.items)
        }

        if (typeof cashFlowResponse.balance === "number") {
          setBalance(cashFlowResponse.balance)
        }

        setRecordToDelete(null)
        setDeleteDialogOpen(false)
      } catch (err) {
        console.error("Erro ao excluir transação:", err)
        setError(err instanceof Error ? err.message : "Erro ao excluir transação")
      }
    }
  }

  const generatePDFReport = () => {
    alert("Funcionalidade de relatório será implementada")
  }

  // Funções de filtro com verificações de segurança
  const getFilteredRecords = () => {
    if (!Array.isArray(financeRecords)) return []
    return financeRecords.filter((record) => {
      const typeMatch = filterType === "all" || (filterType === "entrada" ? record.type === 0 : record.type === 1)
      const categoryMatch = filterCategory === "all" || record.categoryId.toString() === filterCategory

      let dateMatch = true
      if (filterStartDate || filterEndDate) {
        const recordDate = new Date(record.date)
        if (filterStartDate) {
          const startDate = new Date(filterStartDate)
          dateMatch = dateMatch && recordDate >= startDate
        }
        if (filterEndDate) {
          const endDate = new Date(filterEndDate)
          dateMatch = dateMatch && recordDate <= endDate
        }
      }

      return typeMatch && categoryMatch && dateMatch
    })
  }

  const getTotalEntradas = () => {
    return getFilteredRecords()
      .filter((record) => record.type === 0)
      .reduce((sum, record) => sum + (record.amount || 0), 0)
  }

  const getTotalSaidas = () => {
    return getFilteredRecords()
      .filter((record) => record.type === 1)
      .reduce((sum, record) => sum + (record.amount || 0), 0)
  }

  // Funções utilitárias
  const getCategoryColor = (categoryName: string) => {
    const colors = {
      Dízimo: "bg-green-100 text-green-800",
      Oferta: "bg-blue-100 text-blue-800",
      Doação: "bg-purple-100 text-purple-800",
      "Despesas Gerais": "bg-red-100 text-red-800",
      Salários: "bg-orange-100 text-orange-800",
      Manutenção: "bg-yellow-100 text-yellow-800",
      teste: "bg-purple-100 text-purple-800",
      test: "bg-blue-100 text-blue-800",
      aaaaaa: "bg-yellow-100 text-yellow-800",
      testes: "bg-green-100 text-green-800",
      "teste ttt": "bg-orange-100 text-orange-800",
      aaaaaaaaa: "bg-red-100 text-red-800",
    }
    return colors[categoryName as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "pix":
        return "💳"
      case "cartao":
        return "💳"
      case "dinheiro":
        return "💵"
      case "transferencia":
        return "🏦"
      default:
        return "💰"
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando dados financeiros...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          onGenerateReport={generatePDFReport}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onTestAuth={handleTestAuth}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-sm font-medium text-red-600">Erro: {error}</p>
                <Button onClick={() => setError("")} variant="outline" size="sm" className="mt-2">
                  Fechar
                </Button>
              </div>
            )}

            <SummaryCards
              totalEntradas={getTotalEntradas()}
              totalSaidas={getTotalSaidas()}
              saldo={balance}
              totalTransacoes={getFilteredRecords().length}
              formatCurrency={formatCurrency}
            />

            <FiltersBar
              filterType={filterType}
              filterStartDate={filterStartDate}
              filterEndDate={filterEndDate}
              filterCategory={filterCategory}
              categories={financeCategories}
              onFilterTypeChange={setFilterType}
              onFilterStartDateChange={setFilterStartDate}
              onFilterEndDateChange={setFilterEndDate}
              onFilterCategoryChange={setFilterCategory}
            />

            <div className="flex gap-2 mb-4">
              <Button onClick={() => setIsTransactionModalOpen(true)}>Nova Transação</Button>
              <Button onClick={() => setIsCategoryModalOpen(true)} variant="outline">
                Gerenciar Categorias ({financeCategories.length})
              </Button>
              <Button onClick={handleTestCashFlowList} variant="outline" size="sm">
                🧪 Testar Listagem
              </Button>
            </div>

            <TransactionsList
              transactions={getFilteredRecords()}
              viewMode={viewMode}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getCategoryColor={getCategoryColor}
              getCashFlowTypeText={getCashFlowTypeText}
              getMethodIcon={getMethodIcon}
              onViewModeChange={setViewMode}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>
      </div>

      {/* Modais */}
      <NewTransactionModal
        categories={financeCategories}
        isOpen={isTransactionModalOpen}
        onOpenChange={setIsTransactionModalOpen}
        onSubmit={handleCreateTransaction}
      />

      <CategoriesModal
        categories={financeCategories}
        isOpen={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        onCreateCategory={handleCreateCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransaction} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
