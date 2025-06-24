"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  formatCurrency,
  formatDate,
  assetTypeOptions,
  assetConditions,
  getConditionColor,
  convertFormDataToApi,
  convertApiDataToForm,
  type Asset,
} from "@/services/assets.service";
// Removendo a importação do fake-api
import { getUserRole, isAuthenticated } from "@/lib/auth-utils";
// Adicionar ao topo do arquivo, após os outros imports
import { exportAssetsToCSV } from "@/lib/export-utils";

export default function AtivosPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<Partial<Asset>>({});
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Substituindo getUser() por getUserRole()
  const userRole = getUserRole();
  const [hasAccess, setHasAccess] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionar para home se não tiver permissão
  useEffect(() => {
    if (!isAuthenticated() || userRole !== "Admin") {
      setHasAccess(false);
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setHasAccess(true);
    }
  }, [userRole, router]);

  // Todos os useEffect devem vir aqui, antes do return condicional
  useEffect(() => {
    if (editingAsset && editingAsset.photo) {
      setImagePreview(editingAsset.photo);
    } else if (!editingAsset) {
      setImagePreview(null);
    }
  }, [editingAsset]);

  // Carregar dados da API
  const loadAssets = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      const response = await getAssets({
        page,
        pageSize,
        ...filters,
      });
      setAssets(response.items);
      setTotalCount(response.totalCount);
      setCurrentPage(response.pageNumber);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Erro ao carregar ativos:", error);
      // Toast de erro será mostrado automaticamente pelo sistema
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadAssets();
  }, []);

  // Adicionar debounce para busca em tempo real
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || categoryFilter !== "all" || conditionFilter !== "all") {
        loadAssets(1, {
          name: searchTerm,
          type: categoryFilter !== "all" ? Number(categoryFilter) : undefined,
          condition: conditionFilter !== "all" ? conditionFilter : undefined,
        });
      } else {
        loadAssets(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter, conditionFilter]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    // Validar campos obrigatórios
    if (!formData.name?.trim()) {
      errors.name = "O nome do ativo é obrigatório";
    }

    if (!formData.identificationCode?.trim()) {
      errors.identificationCode = "O código de identificação é obrigatório";
    }

    if (!formData.type) {
      errors.type = "A categoria é obrigatória";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Verificação de permissão APÓS todos os hooks
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center p-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600 text-center">
              Esta página é restrita apenas para administradores da igreja.
            </p>
            <p className="text-gray-500 text-sm mt-4">
              Redirecionando para a página inicial...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtros locais
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || asset.type.toString() === categoryFilter;
    const matchesCondition =
      conditionFilter === "all" ||
      asset.condition.toLowerCase() === conditionFilter;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário antes de enviar
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const apiData = convertFormDataToApi(formData);

      if (editingAsset) {
        // Editar ativo existente
        await updateAsset(editingAsset.id, apiData);
      } else {
        // Criar novo ativo
        await createAsset(apiData);
      }

      // Recarregar lista
      await loadAssets(currentPage);

      setIsDialogOpen(false);
      setEditingAsset(null);
      setFormData({});
      setFormErrors({});

      // Toast de sucesso será mostrado automaticamente
    } catch (error) {
      console.error("Erro ao salvar ativo:", error);
      // Toast de erro será mostrado automaticamente
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData(convertApiDataToForm(asset));
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este ativo?")) {
      try {
        await deleteAsset(id);
        await loadAssets(currentPage);
        // Toast de sucesso será mostrado automaticamente
      } catch (error) {
        console.error("Erro ao excluir ativo:", error);
        // Toast de erro será mostrado automaticamente
      }
    }
  };

  const handleFileUpload = (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem (PNG, JPG, JPEG).");
      return;
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB em bytes
    if (file.size > maxSize) {
      alert("O arquivo é muito grande. O tamanho máximo permitido é 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData({ ...formData, photo: result });
      setImagePreview(result);
    };
    reader.onerror = () => {
      alert("Erro ao ler o arquivo. Tente novamente.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, photo: "" });
    setImagePreview(null);
  };

  const openNewAssetDialog = () => {
    setEditingAsset(null);
    setFormData({
      type: 1, // Categoria padrão
    });
    setFormErrors({});
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    if (assets.length === 0) {
      alert("Não há ativos para exportar.");
      return;
    }

    // Usar os ativos filtrados se houver filtros ativos
    const dataToExport = filteredAssets.length > 0 ? filteredAssets : assets;
    exportAssetsToCSV(dataToExport);
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Mapeamento para labels
  const categoryLabels = assetTypeOptions.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {} as Record<number, string>);

  const conditionLabels = assetConditions.reduce((acc, condition) => {
    acc[condition.toLowerCase()] = condition;
    return acc;
  }, {} as Record<string, string>);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setConditionFilter("all");
    loadAssets(1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="hidden md:flex"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="md:hidden"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              onClick={openNewAssetDialog}
              style={{ backgroundColor: "#89f0e6" }}
              className="hover:opacity-90"
            >
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
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Total de Ativos
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {assets.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Valor Total
                  </p>
                  <p className="text-sm md:text-xl font-bold text-gray-900">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Em Bom Estado
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {
                      assets.filter(
                        (a) =>
                          a.condition.toLowerCase() === "excelente" ||
                          a.condition.toLowerCase() === "bom"
                      ).length
                    }
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
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Manutenção
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {
                      assets.filter(
                        (a) =>
                          a.condition.toLowerCase() === "em manutenção" ||
                          a.condition.toLowerCase() === "regular"
                      ).length
                    }
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

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
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

                <Select
                  value={conditionFilter}
                  onValueChange={setConditionFilter}
                >
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

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full md:w-auto"
                >
                  Limpar Filtros
                </Button>
              </div>

              {/* View Toggle */}
              <div className="flex justify-end">
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "cards" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                    className="rounded-r-none"
                    style={
                      viewMode === "cards" ? { backgroundColor: "#89f0e6" } : {}
                    }
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="rounded-l-none"
                    style={
                      viewMode === "table" ? { backgroundColor: "#89f0e6" } : {}
                    }
                  >
                    <List className="h-4 w-4 mr-1" />
                    Tabela
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando ativos...</p>
            </CardContent>
          </Card>
        )}

        {/* Assets Display */}
        {!loading && (
          <>
            {viewMode === "cards" ? (
              /* Cards View */
              <div className="grid gap-4 md:gap-6">
                {filteredAssets.map((asset) => (
                  <Card key={asset.id}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {asset.photo && (
                          <div className="w-full md:w-48 h-32 md:h-24 flex-shrink-0">
                            <img
                              src={asset.photo || "/placeholder.svg"}
                              alt={asset.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {asset.name || "Sem nome"}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">
                                {categoryLabels[asset.type] || "Outros"}
                              </Badge>
                              <Badge
                                className={getConditionColor(asset.condition)}
                              >
                                {asset.condition || "Não informado"}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-3">
                            {asset.description || "Sem descrição"}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                {formatCurrency(asset.value)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{asset.location || "Não informado"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span>
                                {asset.responsible || "Não informado"}
                              </span>
                            </div>
                            {asset.purchaseDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>
                                  Compra: {formatDate(asset.purchaseDate)}
                                </span>
                              </div>
                            )}
                            {asset.warrantyUntil && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-gray-400" />
                                <span>
                                  Garantia: {formatDate(asset.warrantyUntil)}
                                </span>
                              </div>
                            )}
                            {asset.nextMaintenance && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>
                                  Próx. Manutenção:{" "}
                                  {formatDate(asset.nextMaintenance)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-gray-600">
                                Código:
                              </span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                {asset.identificationCode}
                              </span>
                            </div>
                          </div>

                          {asset.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-600">
                                {asset.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(asset)}
                          >
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
                          <th className="text-left p-4 font-medium text-gray-900">
                            Imagem
                          </th>
                          <th className="text-left p-4 font-medium text-gray-900">
                            Nome
                          </th>
                          <th className="text-left p-4 font-medium text-gray-900">
                            Código
                          </th>
                          <th className="text-left p-4 font-medium text-gray-900">
                            Categoria
                          </th>
                          <th className="text-left p-4 font-medium text-gray-900">
                            Valor
                          </th>
                          <th className="text-left p-4 font-medium text-gray-900">
                            Condição
                          </th>
                          <th className="text-left p-4 font-medium text-gray-900">
                            Localização
                          </th>
                          <th className="text-left p-4 font-medium text-gray-900">
                            Responsável
                          </th>
                          <th className="text-left p-4 font-medium text-gray-900">
                            Data Compra
                          </th>
                          <th className="text-left p-4 font-medium text-gray-900">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssets.map((asset, index) => (
                          <tr
                            key={asset.id}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-4">
                              {asset.photo ? (
                                <img
                                  src={asset.photo || "/placeholder.svg"}
                                  alt={asset.name}
                                  className="w-12 h-8 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                                  <Package className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-medium text-gray-900">
                              {asset.name || "Sem nome"}
                            </td>
                            <td className="p-4 text-gray-600">
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 text-xs">
                                {asset.identificationCode}
                              </span>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">
                                {categoryLabels[asset.type] || "Outros"}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium">
                              {formatCurrency(asset.value)}
                            </td>
                            <td className="p-4">
                              <Badge
                                className={getConditionColor(asset.condition)}
                              >
                                {asset.condition || "Não informado"}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-600">
                              {asset.location || "Não informado"}
                            </td>
                            <td className="p-4 text-gray-600">
                              {asset.responsible || "Não informado"}
                            </td>
                            <td className="p-4 text-gray-600">
                              {formatDate(asset.purchaseDate)}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(asset)}
                                >
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
          </>
        )}

        {!loading && filteredAssets.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum ativo encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou adicione um novo ativo.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                  {Math.min(currentPage * pageSize, totalCount)} de {totalCount}{" "}
                  ativos
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAssets(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum =
                        Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                        i;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => loadAssets(pageNum)}
                          style={
                            pageNum === currentPage
                              ? { backgroundColor: "#89f0e6" }
                              : {}
                          }
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAssets(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog for Add/Edit Asset */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setImagePreview(null);
              setFormErrors({});
            }
          }}
        >
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? "Editar Ativo" : "Novo Ativo"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="flex items-center">
                    Nome do Ativo <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) {
                        setFormErrors({ ...formErrors, name: "" });
                      }
                    }}
                    placeholder="Digite o nome do ativo..."
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type" className="flex items-center">
                    Categoria <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.type?.toString() || ""}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        type: Number.parseInt(value),
                      });
                      if (formErrors.type) {
                        setFormErrors({ ...formErrors, type: "" });
                      }
                    }}
                  >
                    <SelectTrigger
                      className={formErrors.type ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Selecione uma categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypeOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.type && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.type}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label
                  htmlFor="identificationCode"
                  className="flex items-center"
                >
                  Código de Identificação{" "}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="identificationCode"
                  value={formData.identificationCode || ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      identificationCode: e.target.value,
                    });
                    if (formErrors.identificationCode) {
                      setFormErrors({ ...formErrors, identificationCode: "" });
                    }
                  }}
                  placeholder="Digite um código único para identificar este ativo..."
                  className={
                    formErrors.identificationCode ? "border-red-500" : ""
                  }
                />
                {formErrors.identificationCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.identificationCode}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Este código é obrigatório e deve ser único para cada ativo.
                </p>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva o ativo..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="purchaseDate">Data de Compra</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition">Condição</Label>
                  <Select
                    value={formData.condition || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, condition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a condição..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assetConditions.map((condition) => (
                        <SelectItem
                          key={condition}
                          value={condition.toLowerCase()}
                        >
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Onde está localizado..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsible">Responsável</Label>
                  <Input
                    id="responsible"
                    value={formData.responsible || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, responsible: e.target.value })
                    }
                    placeholder="Nome do responsável..."
                  />
                </div>

                <div>
                  <Label htmlFor="warrantyUntil">Garantia até</Label>
                  <Input
                    id="warrantyUntil"
                    type="date"
                    value={formData.warrantyUntil || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        warrantyUntil: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastMaintenance: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="nextMaintenance">Próxima Manutenção</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={formData.nextMaintenance || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nextMaintenance: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Informações adicionais sobre o ativo..."
                />
              </div>

              <div>
                <Label>Imagem do Ativo</Label>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
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

                    {!formData.photo ? (
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
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
                          <span className="text-gray-500">
                            {" "}
                            ou arraste uma imagem aqui
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, JPEG até 10MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative inline-block">
                          <img
                            src={formData.photo || "/placeholder.svg"}
                            alt="Preview"
                            className="mx-auto max-w-full h-32 object-cover rounded-md border"
                          />
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            Preview
                          </div>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <label
                            htmlFor="image-upload"
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors"
                          >
                            Trocar Imagem
                          </label>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* URL Input alternativo */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">ou</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">URL da Imagem</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={
                        typeof formData.photo === "string" &&
                        formData.photo.startsWith("http")
                          ? formData.photo
                          : ""
                      }
                      onChange={(e) => {
                        setFormData({ ...formData, photo: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cole aqui a URL de uma imagem hospedada online
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  style={{ backgroundColor: "#89f0e6" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingAsset ? "Salvando..." : "Cadastrando..."}
                    </>
                  ) : editingAsset ? (
                    "Salvar Alterações"
                  ) : (
                    "Cadastrar Ativo"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
