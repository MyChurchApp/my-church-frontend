"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  PiggyBank,
  Receipt,
  Filter,
  Trash2,
  Settings,
  Download,
} from "lucide-react"
import {
  getUser,
  getFinanceRecords,
  getFinanceCategories,
  formatCurrency,
  type User,
  type FinanceRecord,
  type FinanceCategory,
} from "@/lib/fake-api"

export default function FinanceiroPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([])
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterMonth, setFilterMonth] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Form state for new record
  const [newRecord, setNewRecord] = useState({
    type: "",
    categoryId: "",
    description: "",
    amount: "",
    date: "",
    method: "",
    member: "",
  })

  // Form state for new category
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "",
    description: "",
  })

  useEffect(() => {
    const userData = getUser()
    if (!userData) {
      router.push("/login")
      return
    }

    if (userData.accessLevel !== "admin") {
      router.push("/dashboard")
      return
    }

    setUser(userData)
    setFinanceRecords(getFinanceRecords())
    setFinanceCategories(getFinanceCategories())
  }, [router])

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRecord.type || !newRecord.categoryId || !newRecord.description || !newRecord.amount || !newRecord.date)
      return

    const selectedCategory = financeCategories.find((cat) => cat.id === newRecord.categoryId)
    if (!selectedCategory) return

    const record: FinanceRecord = {
      id: Date.now().toString(),
      type: newRecord.type as "entrada" | "saida",
      categoryId: newRecord.categoryId,
      categoryName: selectedCategory.name,
      description: newRecord.description,
      amount: Number.parseFloat(newRecord.amount),
      date: newRecord.date,
      method: newRecord.method as any,
      member: newRecord.member || undefined,
    }

    setFinanceRecords([record, ...financeRecords])
    setNewRecord({ type: "", categoryId: "", description: "", amount: "", date: "", method: "", member: "" })
    setIsDialogOpen(false)
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name || !newCategory.type) return

    const category: FinanceCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      type: newCategory.type as "entrada" | "saida",
      description: newCategory.description,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setFinanceCategories([...financeCategories, category])
    setNewCategory({ name: "", type: "", description: "" })
    setIsCategoryDialogOpen(false)
  }

  const handleDeleteRecord = (recordId: string) => {
    setRecordToDelete(recordId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteRecord = () => {
    if (recordToDelete) {
      setFinanceRecords(financeRecords.filter((record) => record.id !== recordToDelete))
      setRecordToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const generatePDFReport = () => {
    const filteredRecords = getFilteredRecords()
    const totalEntradas = getTotalEntradas()
    const totalSaidas = getTotalSaidas()
    const saldo = getSaldo()

    // Criar conteúdo HTML para o PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Financeiro</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .summary { margin-bottom: 30px; background: #f5f5f5; padding: 15px; border-radius: 5px; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .summary-item { text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .entrada { color: #22c55e; }
          .saida { color: #ef4444; }
          .saldo { color: #3b82f6; }
          .transaction-section { margin-bottom: 30px; }
          .transaction-item { margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          .transaction-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
          .transaction-title { font-weight: bold; font-size: 16px; }
          .transaction-amount { font-size: 18px; font-weight: bold; }
          .transaction-details { color: #666; font-size: 14px; }
          .category-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 10px; }
          .category-entrada { background: #dcfce7; color: #166534; }
          .category-saida { background: #fee2e2; color: #991b1b; }
          h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RELATÓRIO FINANCEIRO</h1>
          <p>Igreja Batista Central</p>
          <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
        </div>

        <div class="summary">
          <h2>RESUMO FINANCEIRO</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value entrada">${formatCurrency(totalEntradas)}</div>
              <p>Total de Entradas</p>
            </div>
            <div class="summary-item">
              <div class="summary-value saida">${formatCurrency(totalSaidas)}</div>
              <p>Total de Saídas</p>
            </div>
            <div class="summary-item">
              <div class="summary-value ${saldo >= 0 ? "entrada" : "saida"}">${formatCurrency(saldo)}</div>
              <p>Saldo Final</p>
            </div>
            <div class="summary-item">
              <div class="summary-value">${filteredRecords.length}</div>
              <p>Total de Transações</p>
            </div>
          </div>
        </div>

        <div class="transaction-section">
          <h2>DETALHAMENTO DAS TRANSAÇÕES</h2>
          ${filteredRecords
            .map(
              (record) => `
            <div class="transaction-item">
              <div class="transaction-header">
                <div class="transaction-title">${record.description}</div>
                <div class="transaction-amount ${record.type}">${record.type === "entrada" ? "+" : "-"}${formatCurrency(record.amount)}</div>
              </div>
              <div class="transaction-details">
                <span class="category-badge category-${record.type}">${record.categoryName}</span>
                <strong>Data:</strong> ${new Date(record.date).toLocaleDateString("pt-BR")} | 
                <strong>Método:</strong> ${record.method} 
                ${record.member ? `| <strong>Membro:</strong> ${record.member}` : ""}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          <p>Relatório gerado automaticamente pelo Sistema MyChurch</p>
        </div>
      </body>
      </html>
    `

    // Criar e baixar o arquivo HTML que pode ser convertido para PDF
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Mostrar instruções para o usuário
    alert(
      "Relatório gerado! Para converter para PDF:\n1. Abra o arquivo HTML baixado\n2. Use Ctrl+P (ou Cmd+P no Mac)\n3. Selecione 'Salvar como PDF' como destino",
    )
  }

  const getFilteredRecords = () => {
    return financeRecords.filter((record) => {
      const typeMatch = filterType === "all" || record.type === filterType
      const monthMatch = filterMonth === "all" || new Date(record.date).getMonth() === Number.parseInt(filterMonth)
      const categoryMatch = filterCategory === "all" || record.categoryId === filterCategory
      return typeMatch && monthMatch && categoryMatch
    })
  }

  const getTotalEntradas = () => {
    return getFilteredRecords()
      .filter((record) => record.type === "entrada")
      .reduce((sum, record) => sum + record.amount, 0)
  }

  const getTotalSaidas = () => {
    return getFilteredRecords()
      .filter((record) => record.type === "saida")
      .reduce((sum, record) => sum + record.amount, 0)
  }

  const getSaldo = () => {
    return getTotalEntradas() - getTotalSaidas()
  }

  const getCategoryColor = (categoryName: string) => {
    const colors = {
      Dízimo: "bg-green-100 text-green-800",
      Oferta: "bg-blue-100 text-blue-800",
      Doação: "bg-purple-100 text-purple-800",
      "Despesas Gerais": "bg-red-100 text-red-800",
      Salários: "bg-orange-100 text-orange-800",
      Manutenção: "bg-yellow-100 text-yellow-800",
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

  const getAvailableCategories = (type: string) => {
    return financeCategories.filter((cat) => cat.isActive && (type === "" || cat.type === type))
  }

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
              <p className="text-gray-600">Controle financeiro da igreja</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={generatePDFReport} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Relatório PDF
              </Button>
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Categorias
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Gerenciar Categorias</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="list" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="list">Lista</TabsTrigger>
                      <TabsTrigger value="add">Adicionar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="list" className="space-y-2 max-h-60 overflow-y-auto">
                      {financeCategories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-500">{category.type === "entrada" ? "Entrada" : "Saída"}</p>
                          </div>
                          <Badge variant={category.type === "entrada" ? "default" : "destructive"}>
                            {category.type === "entrada" ? "Entrada" : "Saída"}
                          </Badge>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="add">
                      <form onSubmit={handleCreateCategory} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="category-name">Nome da Categoria</Label>
                          <Input
                            id="category-name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="Ex: Manutenção"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category-type">Tipo</Label>
                          <Select
                            value={newCategory.type}
                            onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entrada">Entrada</SelectItem>
                              <SelectItem value="saida">Saída</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category-description">Descrição (opcional)</Label>
                          <Input
                            id="category-description"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            placeholder="Descrição da categoria"
                          />
                        </div>

                        <Button type="submit" className="w-full">
                          Criar Categoria
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateRecord} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="record-type">Tipo</Label>
                      <Select
                        value={newRecord.type}
                        onValueChange={(value) => setNewRecord({ ...newRecord, type: value, categoryId: "" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="record-category">Categoria</Label>
                      <Select
                        value={newRecord.categoryId}
                        onValueChange={(value) => setNewRecord({ ...newRecord, categoryId: value })}
                        disabled={!newRecord.type}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableCategories(newRecord.type).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="record-description">Descrição</Label>
                      <Input
                        id="record-description"
                        value={newRecord.description}
                        onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                        placeholder="Descrição da transação"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="record-amount">Valor</Label>
                        <Input
                          id="record-amount"
                          type="number"
                          step="0.01"
                          value={newRecord.amount}
                          onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
                          placeholder="0,00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="record-date">Data</Label>
                        <Input
                          id="record-date"
                          type="date"
                          value={newRecord.date}
                          onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="record-method">Método</Label>
                      <Select
                        value={newRecord.method}
                        onValueChange={(value) => setNewRecord({ ...newRecord, method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Forma de pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="cartao">Cartão</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newRecord.type === "entrada" && (
                      <div className="space-y-2">
                        <Label htmlFor="record-member">Membro (opcional)</Label>
                        <Input
                          id="record-member"
                          value={newRecord.member}
                          onChange={(e) => setNewRecord({ ...newRecord, member: e.target.value })}
                          placeholder="Nome do membro"
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      Registrar Transação
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalEntradas())}</div>
                  <p className="text-xs text-muted-foreground">Dízimos, ofertas e doações</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(getTotalSaidas())}</div>
                  <p className="text-xs text-muted-foreground">Despesas e salários</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getSaldo() >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(getSaldo())}
                  </div>
                  <p className="text-xs text-muted-foreground">Entradas - Saídas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transações</CardTitle>
                  <Receipt className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getFilteredRecords().length}</div>
                  <p className="text-xs text-muted-foreground">Total de registros</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="mb-6 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="entrada">Entradas</SelectItem>
                    <SelectItem value="saida">Saídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  <SelectItem value="0">Janeiro</SelectItem>
                  <SelectItem value="1">Fevereiro</SelectItem>
                  <SelectItem value="2">Março</SelectItem>
                  <SelectItem value="3">Abril</SelectItem>
                  <SelectItem value="4">Maio</SelectItem>
                  <SelectItem value="5">Junho</SelectItem>
                  <SelectItem value="6">Julho</SelectItem>
                  <SelectItem value="7">Agosto</SelectItem>
                  <SelectItem value="8">Setembro</SelectItem>
                  <SelectItem value="9">Outubro</SelectItem>
                  <SelectItem value="10">Novembro</SelectItem>
                  <SelectItem value="11">Dezembro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {financeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Histórico de Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredRecords().map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${record.type === "entrada" ? "bg-green-100" : "bg-red-100"}`}
                        >
                          {record.type === "entrada" ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{record.description}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCategoryColor(record.categoryName)}>{record.categoryName}</Badge>
                            <span className="text-sm text-gray-500">
                              {getMethodIcon(record.method)} {record.method}
                            </span>
                            {record.member && <span className="text-sm text-gray-500">• {record.member}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${record.type === "entrada" ? "text-green-600" : "text-red-600"}`}
                          >
                            {record.type === "entrada" ? "+" : "-"}
                            {formatCurrency(record.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {getFilteredRecords().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma transação encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
            <AlertDialogAction onClick={confirmDeleteRecord} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
