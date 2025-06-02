"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  Grid3X3,
  List,
  FileText,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

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
  image?: string
}

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
  const [assets, setAssets] = useState<Asset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [formData, setFormData] = useState<Partial<Asset>>({})
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { user, isLoading: authLoading } = useAuth()

  // Carregar ativos da API real
  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // TODO: Implementar chamada para API real
        // const response = await fetch('/api/assets', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   }
        // })
        // const data = await response.json()
        // setAssets(data)

        console.log("Carregando ativos - aguardando integração com API real")
        setAssets([])
      } catch (error) {
        console.error("Erro ao carregar ativos:", error)
        setError("Erro ao carregar ativos. Tente novamente.")
        setAssets([])
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadAssets()
    }
  }, [user])

  useEffect(() => {
    if (editingAsset && editingAsset.image) {
      setImagePreview(editingAsset.image)
    } else if (!editingAsset) {
      setImagePreview(null)
    }
  }, [editingAsset])

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Verificação de permissão
  const isAdmin = user?.role === "Admin" || user?.role === 1 || user?.role === "1" || user?.accessLevel === "admin"

  if (!user || !isAdmin) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingAsset) {
        // TODO: Implementar chamada para API real - Editar
        // const response = await fetch(`/api/assets/${editingAsset.id}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   },
        //   body: JSON.stringify(formData)
        // })
        // const updatedAsset = await response.json()
        // setAssets(assets.map(asset => asset.id === editingAsset.id ? updatedAsset : asset))

        console.log("Editando ativo - aguardando integração com API real:", formData)
      } else {
        // TODO: Implementar chamada para API real - Criar
        // const response = await fetch('/api/assets', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   },
        //   body: JSON.stringify(formData)
        // })
        // const newAsset = await response.json()
        // setAssets([...assets, newAsset])

        console.log("Criando ativo - aguardando integração com API real:", formData)
      }

      setIsDialogOpen(false)
      setEditingAsset(null)
      setFormData({})
    } catch (error) {
      console.error("Erro ao salvar ativo:", error)
      alert("Erro ao salvar ativo. Tente novamente.")
    }
  }

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset)
    setFormData(asset)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ativo?")) return

    try {
      // TODO: Implementar chamada para API real
      // const response = await fetch(`/api/assets/${id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // })
      // if (response.ok) {
      //   setAssets(assets.filter(asset => asset.id !== id))
      // }

      console.log(`Deletando ativo ${id} - aguardando integração com API real`)
    } catch (error) {
      console.error("Erro ao deletar ativo:", error)
      alert("Erro ao deletar ativo. Tente novamente.")
    }
  }

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFormData({ ...formData, image: result })
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    } else {
      alert("Por favor, selecione apenas arquivos de imagem.")
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image: undefined })
    setImagePreview(null)
  }

  const openNewAssetDialog = () => {
    setEditingAsset(null)
    setFormData({})
    setImagePreview(null)
    setIsDialogOpen(true)
  }

  const generatePDF = () => {
    if (assets.length === 0) {
      alert("Nenhum ativo encontrado para gerar relatório.")
      return
    }

    // TODO: Implementar geração real de PDF
    console.log("Gerando PDF - aguardando implementação real")
    alert("Funcionalidade de PDF será implementada com a integração da API.")
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
          <div className="flex gap-2">
            <Button onClick={generatePDF} variant="outline" className="hidden md:flex">
              <FileText className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
            <Button onClick={generatePDF} variant="outline" className="md:hidden">
              <FileText className="h-4 w-4" />
            </Button>
            <Button onClick={openNewAssetDialog} style={{ backgroundColor: "#89f0e6" }} className="hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Novo Ativo</span>
              <span className="md:hidden">Novo</span>
            </Button>
          </div>
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

        {/* Filters and View Toggle */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-4">
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

              {/* View Toggle */}
              <div className="flex justify-end">
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "cards" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                    className="rounded-r-none"
                    style={viewMode === "cards" ? { backgroundColor: "#89f0e6" } : {}}
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="rounded-l-none"
                    style={viewMode === "table" ? { backgroundColor: "#89f0e6" } : {}}
                  >
                    <List className="h-4 w-4 mr-1" />
                    Tabela
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao Carregar Ativos</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!error && assets.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ativo encontrado</h3>
              <p className="text-gray-600 mb-4">Comece adicionando o primeiro ativo da sua igreja.</p>
              <Button onClick={openNewAssetDialog} style={{ backgroundColor: "#89f0e6" }}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Ativo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Assets Display - só mostra se houver ativos */}
        {assets.length > 0 && (
          <>
            {viewMode === "cards" ? (
              /* Cards View */
              <div className="grid gap-4 md:gap-6">
                {filteredAssets.map((asset) => (
                  <Card key={asset.id}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {asset.image && (
                          <div className="w-full md:w-48 h-32 md:h-24 flex-shrink-0">
                            <img
                              src={asset.image || "/placeholder.svg"}
                              alt={asset.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{categoryLabels[asset.category]}</Badge>
                              <Badge className={conditionColors[asset.condition]}>
                                {conditionLabels[asset.condition]}
                              </Badge>
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
            ) : (
              /* Table View */
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-900">Nome</th>
                          <th className="text-left p-4 font-medium text-gray-900">Categoria</th>
                          <th className="text-left p-4 font-medium text-gray-900">Valor</th>
                          <th className="text-left p-4 font-medium text-gray-900">Condição</th>
                          <th className="text-left p-4 font-medium text-gray-900">Localização</th>
                          <th className="text-left p-4 font-medium text-gray-900">Responsável</th>
                          <th className="text-left p-4 font-medium text-gray-900">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssets.map((asset, index) => (
                          <tr key={asset.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-4 font-medium text-gray-900">{asset.name}</td>
                            <td className="p-4">
                              <Badge variant="outline">{categoryLabels[asset.category]}</Badge>
                            </td>
                            <td className="p-4 font-medium">{formatCurrency(asset.value)}</td>
                            <td className="p-4">
                              <Badge className={conditionColors[asset.condition]}>
                                {conditionLabels[asset.condition]}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-600">{asset.location}</td>
                            <td className="p-4 text-gray-600">{asset.responsible}</td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(asset)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(asset.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredAssets.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ativo encontrado</h3>
                  <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Dialog for Add/Edit Asset */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setImagePreview(null)
            }
          }}
        >
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

              <div>
                <Label>Imagem do Ativo</Label>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />

                    {!formData.image ? (
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                        <div>
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer text-blue-600 hover:text-blue-500 font-medium"
                          >
                            Clique para selecionar
                          </label>
                          <span className="text-gray-500"> ou arraste uma imagem aqui</span>
                        </div>
                        <p className="text-xs text-gray-400">PNG, JPG, JPEG até 10MB</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <img
                          src={formData.image || "/placeholder.svg"}
                          alt="Preview"
                          className="mx-auto max-w-full h-32 object-cover rounded-md"
                        />
                        <div className="flex gap-2 justify-center">
                          <label
                            htmlFor="image-upload"
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                          >
                            Trocar
                          </label>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* URL Input alternativo */}
                  <div className="text-center text-gray-500 text-sm">
                    <span>ou</span>
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">URL da Imagem</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={
                        typeof formData.image === "string" && formData.image.startsWith("http") ? formData.image : ""
                      }
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value })
                        setImagePreview(e.target.value)
                      }}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" style={{ backgroundColor: "#89f0e6" }}>
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
