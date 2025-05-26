"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { getUser, hasPermission } from "@/lib/fake-api"

interface Asset {
  id: string
  name: string
  category: "equipamento" | "mobiliario" | "veiculo" | "imovel" | "tecnologia" | "outros"
  description: string
  value: number
  purchaseDate: string
  condition: "excelente" | "bom" | "regular" | "ruim" | "manutencao"
  location: string
  responsible: string
  warranty: string
  notes?: string
  lastMaintenance?: string
  nextMaintenance?: string
}

const fakeAssets: Asset[] = [
  {
    id: "1",
    name: "Sistema de Som Principal",
    category: "equipamento",
    description: "Mesa de som digital 32 canais com amplificadores",
    value: 15000,
    purchaseDate: "2023-03-15",
    condition: "excelente",
    location: "Templo Principal",
    responsible: "Carlos Oliveira",
    warranty: "2025-03-15",
    notes: "Equipamento principal para cultos",
    lastMaintenance: "2024-12-10",
    nextMaintenance: "2025-06-10",
  },
  {
    id: "2",
    name: "Projetor Multimídia",
    category: "tecnologia",
    description: "Projetor 4K para apresentações e cultos",
    value: 8500,
    purchaseDate: "2024-01-20",
    condition: "excelente",
    location: "Templo Principal",
    responsible: "Gabriel Costa",
    warranty: "2027-01-20",
    notes: "Usado para projeções durante os cultos",
  },
  {
    id: "3",
    name: "Van da Igreja",
    category: "veiculo",
    description: "Van 15 lugares para transporte de membros",
    value: 85000,
    purchaseDate: "2022-08-10",
    condition: "bom",
    location: "Garagem da Igreja",
    responsible: "Pedro Mendes",
    warranty: "2025-08-10",
    notes: "Usada para retiros e eventos",
    lastMaintenance: "2024-11-15",
    nextMaintenance: "2025-05-15",
  },
  {
    id: "4",
    name: "Piano Digital",
    category: "equipamento",
    description: "Piano digital 88 teclas para ministério de música",
    value: 12000,
    purchaseDate: "2023-06-05",
    condition: "excelente",
    location: "Sala de Música",
    responsible: "Beatriz Santos",
    warranty: "2026-06-05",
    notes: "Instrumento principal do grupo de louvor",
  },
  {
    id: "5",
    name: "Cadeiras do Templo",
    category: "mobiliario",
    description: "Conjunto de 200 cadeiras estofadas",
    value: 25000,
    purchaseDate: "2021-12-01",
    condition: "bom",
    location: "Templo Principal",
    responsible: "Secretaria",
    warranty: "2026-12-01",
    notes: "Cadeiras principais do templo",
  },
  {
    id: "6",
    name: "Ar Condicionado Central",
    category: "equipamento",
    description: "Sistema de climatização central 60.000 BTUs",
    value: 18000,
    purchaseDate: "2023-02-10",
    condition: "regular",
    location: "Templo Principal",
    responsible: "Manutenção",
    warranty: "2028-02-10",
    notes: "Necessita manutenção preventiva",
    lastMaintenance: "2024-08-20",
    nextMaintenance: "2025-02-20",
  },
]

const categoryLabels = {
  equipamento: "Equipamento",
  mobiliario: "Mobiliário",
  veiculo: "Veículo",
  imovel: "Imóvel",
  tecnologia: "Tecnologia",
  outros: "Outros",
}

const conditionLabels = {
  excelente: "Excelente",
  bom: "Bom",
  regular: "Regular",
  ruim: "Ruim",
  manutencao: "Em Manutenção",
}

const conditionColors = {
  excelente: "bg-green-100 text-green-800",
  bom: "bg-blue-100 text-blue-800",
  regular: "bg-yellow-100 text-yellow-800",
  ruim: "bg-red-100 text-red-800",
  manutencao: "bg-orange-100 text-orange-800",
}

export default function AtivosPage() {
  const [assets, setAssets] = useState<Asset[]>(fakeAssets)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [formData, setFormData] = useState<Partial<Asset>>({})

  const user = getUser()

  // Verificar se o usuário tem permissão de admin
  if (!user || !hasPermission(user.accessLevel, "admin") || user.accessLevel !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center p-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 text-center">Esta página é restrita apenas para administradores da igreja.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.responsible.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter
    const matchesCondition = conditionFilter === "all" || asset.condition === conditionFilter

    return matchesSearch && matchesCategory && matchesCondition
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAsset) {
      // Editar ativo existente
      setAssets(assets.map((asset) => (asset.id === editingAsset.id ? { ...asset, ...formData } : asset)))
    } else {
      // Criar novo ativo
      const newAsset: Asset = {
        id: Date.now().toString(),
        name: formData.name || "",
        category: (formData.category as Asset["category"]) || "outros",
        description: formData.description || "",
        value: formData.value || 0,
        purchaseDate: formData.purchaseDate || "",
        condition: (formData.condition as Asset["condition"]) || "bom",
        location: formData.location || "",
        responsible: formData.responsible || "",
        warranty: formData.warranty || "",
        notes: formData.notes,
        lastMaintenance: formData.lastMaintenance,
        nextMaintenance: formData.nextMaintenance,
      }
      setAssets([...assets, newAsset])
    }

    setIsDialogOpen(false)
    setEditingAsset(null)
    setFormData({})
  }

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset)
    setFormData(asset)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este ativo?")) {
      setAssets(assets.filter((asset) => asset.id !== id))
    }
  }

  const openNewAssetDialog = () => {
    setEditingAsset(null)
    setFormData({})
    setIsDialogOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Ativos da Igreja</h1>
            <p className="text-gray-600 mt-1">Gerencie os bens e equipamentos da igreja</p>
          </div>
          <Button onClick={openNewAssetDialog} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Novo Ativo</span>
            <span className="md:hidden">Novo</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Total de Ativos</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{assets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-sm md:text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Em Bom Estado</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {assets.filter((a) => a.condition === "excelente" || a.condition === "bom").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Manutenção</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {assets.filter((a) => a.condition === "manutencao" || a.condition === "regular").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar ativos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Condição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(conditionLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assets List */}
        <div className="grid gap-4 md:gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{categoryLabels[asset.category]}</Badge>
                        <Badge className={conditionColors[asset.condition]}>{conditionLabels[asset.condition]}</Badge>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">{asset.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatCurrency(asset.value)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{asset.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{asset.responsible}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Compra: {formatDate(asset.purchaseDate)}</span>
                      </div>
                      {asset.warranty && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-gray-400" />
                          <span>Garantia: {formatDate(asset.warranty)}</span>
                        </div>
                      )}
                      {asset.nextMaintenance && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>Próx. Manutenção: {formatDate(asset.nextMaintenance)}</span>
                        </div>
                      )}
                    </div>

                    {asset.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">{asset.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(asset)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(asset.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ativo encontrado</h3>
              <p className="text-gray-600">Tente ajustar os filtros ou adicione um novo ativo.</p>
            </CardContent>
          </Card>
        )}

        {/* Dialog for Add/Edit Asset */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAsset ? "Editar Ativo" : "Novo Ativo"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Ativo *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) => setFormData({ ...formData, category: value as Asset["category"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Valor (R$) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value || ""}
                    onChange={(e) => setFormData({ ...formData, value: Number.parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="purchaseDate">Data de Compra *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate || ""}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition">Condição *</Label>
                  <Select
                    value={formData.condition || ""}
                    onValueChange={(value) => setFormData({ ...formData, condition: value as Asset["condition"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(conditionLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Localização *</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsible">Responsável *</Label>
                  <Input
                    id="responsible"
                    value={formData.responsible || ""}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="warranty">Garantia até</Label>
                  <Input
                    id="warranty"
                    type="date"
                    value={formData.warranty || ""}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lastMaintenance">Última Manutenção</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={formData.lastMaintenance || ""}
                    onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="nextMaintenance">Próxima Manutenção</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={formData.nextMaintenance || ""}
                    onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o ativo..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingAsset ? "Salvar Alterações" : "Cadastrar Ativo"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
