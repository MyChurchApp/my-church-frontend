"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import { getAssets, type Asset } from "@/services/ativos/assets.service";
import { getUser, isAuthenticated } from "@/lib/auth-utils";
import { exportAssetsToCSV } from "@/lib/export-utils";

// Importando os novos componentes
import { HeaderActions } from "../components/Ativos/HeaderActions/HeaderActions";
import { StatsCards } from "../components/Ativos/StatsCards/StatsCards";
import { FilterBar } from "../components/Ativos/FilterBar/FilterBar";
import { AssetsDisplay } from "../components/Ativos/AssetsDisplay/AssetsDisplay";
import { PaginationControls } from "../components/Ativos/PaginationControls/PaginationControls";
import { AssetFormModal } from "../components/Ativos/AssetFormModal/AssetFormModal";

export default function AtivosPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State para paginação e filtros
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    name: "",
    type: "all",
    condition: "all",
  });

  // State para o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // State para permissão de acesso
  const [hasAccess, setHasAccess] = useState(false);

  const userRole = getUser();

  // Verificação de permissão
  useEffect(() => {
    if (!isAuthenticated() || userRole.role !== "Admin") {
      setHasAccess(false);
      const timer = setTimeout(() => router.push("/dashboard"), 2000);
      return () => clearTimeout(timer);
    } else {
      setHasAccess(true);
    }
  }, [userRole, router]);

  // Função para carregar os ativos da API
  const loadAssets = useCallback(
    async (page = 1, currentFilters = filters) => {
      setLoading(true);
      try {
        const apiFilters = {
          name: currentFilters.name || undefined,
          type:
            currentFilters.type !== "all"
              ? Number(currentFilters.type)
              : undefined,
          condition:
            currentFilters.condition !== "all"
              ? currentFilters.condition
              : undefined,
        };
        const response = await getAssets({ page, pageSize: 10, ...apiFilters });
        setAssets(response.items);
        setTotalCount(response.totalCount);
        setCurrentPage(response.pageNumber);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Erro ao carregar ativos:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Efeito para carregar os ativos com debounce nos filtros
  useEffect(() => {
    const handler = setTimeout(() => {
      loadAssets(1, filters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters, loadAssets]);

  // Funções de manipulação de eventos
  const handleOpenNewModal = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    if (assets.length === 0) {
      alert("Não há ativos para exportar.");
      return;
    }
    exportAssetsToCSV(assets);
  };

  const handleFormSubmitSuccess = () => {
    setIsModalOpen(false);
    loadAssets(currentPage, filters);
  };

  // Renderização condicional para acesso negado
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
              Esta página é restrita para administradores.
            </p>
            <p className="text-gray-500 text-sm mt-4">Redirecionando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-4 md:p-6 space-y-6">
        <HeaderActions
          onNewAsset={handleOpenNewModal}
          onExport={handleExport}
        />

        <StatsCards assets={assets} />

        <FilterBar onFiltersChange={setFilters} initialFilters={filters} />

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando ativos...</p>
            </CardContent>
          </Card>
        ) : assets.length > 0 ? (
          <>
            <AssetsDisplay
              assets={assets}
              onEdit={handleEdit}
              onDelete={() => loadAssets(currentPage, filters)}
            />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={10}
              onPageChange={(page) => loadAssets(page, filters)}
            />
          </>
        ) : (
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
      </div>

      <AssetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAsset={editingAsset}
        onSubmitSuccess={handleFormSubmitSuccess}
      />
    </div>
  );
}
