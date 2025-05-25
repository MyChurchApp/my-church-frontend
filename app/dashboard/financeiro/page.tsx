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
import { DollarSign, TrendingUp, TrendingDown, Plus, PiggyBank, Receipt, Filter } from "lucide-react"
import { getUser, getFinanceRecords, formatCurrency, type User, type FinanceRecord } from "@/lib/fake-api"

export default function FinanceiroPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterMonth, setFilterMonth] = useState<string>("all")

  // Form state for new record
  const [newRecord, setNewRecord] = useState({
    type: "",
    category: "",
    description: "",
    amount: "",
    date: "",
    method: "",
    member: "",
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
  }, [router])

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRecord.type || !newRecord.category || !newRecord.description || !newRecord.amount || !newRecord.date) return

    const record: FinanceRecord = {
      id: Date.now().toString(),
      type: newRecord.type as "entrada" | "saida",
      category: newRecord.category as any,
      description: newRecord.description,
      amount: Number.parseFloat(newRecord.amount),
      date: newRecord.date,
      method: newRecord.method as any,
      member: newRecord.member || undefined,
    }

    setFinanceRecords([record, ...financeRecords])
    setNewRecord({ type: "", category: "", description: "", amount: "", date: "", method: "", member: "" })
    setIsDialogOpen(false)
  }

  const getFilteredRecords = () => {
    return financeRecords.filter((record) => {
      const typeMatch = filterType === "all" || record.type === filterType
      const monthMatch = filterMonth === "all" || new Date(record.date).getMonth() === Number.parseInt(filterMonth)
      return typeMatch && monthMatch
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

  const getCategoryColor = (category: string) => {
    const colors = {
      dizimo: "bg-green-100 text-green-800",
      oferta: "bg-blue-100 text-blue-800",
      doacao: "bg-purple-100 text-purple-800",
      despesa: "bg-red-100 text-red-800",
      salario: "bg-orange-100 text-orange-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Transação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Transação</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateRecord} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="record-type">Tipo</Label>
                    <Select
                      value={newRecord.type}
                      onValueChange={(value) => setNewRecord({ ...newRecord, type: value })}
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
                      value={newRecord.category}
                      onValueChange={(value) => setNewRecord({ ...newRecord, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {newRecord.type === "entrada" ? (
                          <>
                            <SelectItem value="dizimo">Dízimo</SelectItem>
                            <SelectItem value="oferta">Oferta</SelectItem>
                            <SelectItem value="doacao">Doação</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="despesa">Despesa</SelectItem>
                            <SelectItem value="salario">Salário</SelectItem>
                          </>
                        )}
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
            <div className="mb-6 flex items-center gap-4">
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
                            <Badge className={getCategoryColor(record.category)}>
                              {record.category.charAt(0).toUpperCase() + record.category.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {getMethodIcon(record.method)} {record.method}
                            </span>
                            {record.member && <span className="text-sm text-gray-500">• {record.member}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${record.type === "entrada" ? "text-green-600" : "text-red-600"}`}
                        >
                          {record.type === "entrada" ? "+" : "-"}
                          {formatCurrency(record.amount)}
                        </div>
                        <div className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString("pt-BR")}</div>
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
    </div>
  )
}
