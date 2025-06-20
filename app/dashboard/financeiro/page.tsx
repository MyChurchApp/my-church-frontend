"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Componentes burros
import { PageHeader } from "@/components/financeiro/page-header";
import { SummaryCards } from "@/components/financeiro/summary-cards";
import { FiltersBar } from "@/components/financeiro/filters-bar";
import { TransactionsList } from "@/components/financeiro/transactions-list";
import { NewTransactionModal } from "@/components/financeiro/new-transaction-modal";
import { CategoriesModal } from "@/components/financeiro/categories-modal";
import { EditTransactionModal } from "@/components/financeiro/edit-transaction-modal";

// Services
import {
  getCashFlowList,
  getCashFlowCategories,
  createCashFlow,
  updateCashFlow,
  createCashFlowCategory,
  updateCashFlowCategory,
  deleteCashFlowCategory,
  deleteCashFlow,
  formatCurrency,
  formatDate,
  formatDateToISO,
  getCashFlowTypeText,
  getCashFlowTypeNumber,
  type CashFlowItem,
  type CashFlowCategory,
  type CreateCashFlowRequest,
} from "@/services/financeiro.service";

export default function FinanceiroPage() {
  const router = useRouter();

  // Estados com valores padrão seguros
  const [financeRecords, setFinanceRecords] = useState<CashFlowItem[]>([]);
  const [financeCategories, setFinanceCategories] = useState<
    CashFlowCategory[]
  >([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Estados dos modais
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<CashFlowItem | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<CashFlowCategory | null>(null);

  // Estados dos filtros
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // ✅ Função de teste de autenticação CORRIGIDA com "Bearer "
  const handleTestAuth = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("❌ Token não encontrado no localStorage!");
      return;
    }

    try {
      // ✅ CORRIGIDO: Agora usa "Bearer " (com espaço) antes do token
      const response = await fetch(
        "https://demoapp.top1soft.com.br/api/CashFlow",
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ ESPAÇO APÓS "Bearer"
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }

        // ✅ CORRIGIDO: Verificar estrutura { result: {...}, balance: number }
        const count =
          data &&
          data.result &&
          data.result.items &&
          Array.isArray(data.result.items)
            ? data.result.items.length
            : "N/A";
        const total =
          data && data.result && data.result.totalCount
            ? data.result.totalCount
            : "N/A";
        const balance = data && data.balance ? data.balance : "N/A";
        alert(
          `✅ Sucesso! ${count} transações carregadas (${total} no total)\n💰 Saldo: R$ ${balance}`
        );
      } else {
        const errorText = await response.text();
        console.error("❌ Erro:", errorText);
        alert(`❌ Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
    }
  };

  // ✅ Carregar dados iniciais CORRIGIDO para nova estrutura da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ CORRIGIDO: Agora getCashFlowList retorna { transactions, balance }
        const [cashFlowResponse, categoriesResponse] = await Promise.allSettled(
          [
            getCashFlowList({ pageNumber: 1, pageSize: 100 }),
            getCashFlowCategories(),
          ]
        );

        // ✅ CORRIGIDO: Processar resposta que inclui transactions e balance
        if (cashFlowResponse.status === "fulfilled" && cashFlowResponse.value) {
          const { transactions, balance: apiBalance } = cashFlowResponse.value;

          if (transactions?.items && Array.isArray(transactions.items)) {
            setFinanceRecords(transactions.items);
          } else {
            setFinanceRecords([]);
          }

          // ✅ CORRIGIDO: Usar o saldo que vem da listagem
          if (typeof apiBalance === "number") {
            setBalance(apiBalance);
          } else {
            setBalance(0);
          }
        } else {
          setFinanceRecords([]);
          setBalance(0);
        }

        // Processar categorias
        if (
          categoriesResponse.status === "fulfilled" &&
          categoriesResponse.value
        ) {
          const cats = categoriesResponse.value;
          setFinanceCategories(Array.isArray(cats) ? cats : []);
        } else {
          setFinanceCategories([]);
        }
      } catch (err) {
        console.error("❌ Erro ao carregar dados:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        // Garantir arrays vazios em caso de erro
        setFinanceRecords([]);
        setFinanceCategories([]);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ✅ Funções de manipulação CORRIGIDAS para nova estrutura

  // ✅ NOVA: Função para abrir modal de edição
  const handleOpenEditModal = (transaction: CashFlowItem) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // ✅ NOVA: Função para editar transação
  const handleEditTransaction = async (data: {
    type: string;
    categoryId: string;
    description: string;
    amount: string;
    date: string;
  }) => {
    if (!editingTransaction) return;

    try {
      const recordData: CreateCashFlowRequest = {
        amount: Number.parseFloat(data.amount),
        date: formatDateToISO(new Date(data.date)),
        description: data.description,
        type: getCashFlowTypeNumber(data.type),
        categoryId: Number.parseInt(data.categoryId),
      };

      await updateCashFlow(editingTransaction.id, recordData);

      // Recarregar dados
      const cashFlowResponse = await getCashFlowList({
        pageNumber: 1,
        pageSize: 100,
      });

      if (cashFlowResponse.transactions?.items) {
        setFinanceRecords(cashFlowResponse.transactions.items);
      }

      if (typeof cashFlowResponse.balance === "number") {
        setBalance(cashFlowResponse.balance);
      }

      setIsEditModalOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error("Erro ao editar transação:", err);
      setError(err instanceof Error ? err.message : "Erro ao editar transação");
    }
  };
  const handleCreateTransaction = async (data: {
    type: string;
    categoryId: string;
    description: string;
    amount: string;
    date: string;
  }) => {
    try {
      const recordData: CreateCashFlowRequest = {
        amount: Number.parseFloat(data.amount),
        date: formatDateToISO(new Date(data.date)),
        description: data.description,
        type: getCashFlowTypeNumber(data.type),
        categoryId: Number.parseInt(data.categoryId),
      };

      await createCashFlow(recordData);

      // ✅ CORRIGIDO: Recarregar dados usando nova estrutura
      const cashFlowResponse = await getCashFlowList({
        pageNumber: 1,
        pageSize: 100,
      });

      if (cashFlowResponse.transactions?.items) {
        setFinanceRecords(cashFlowResponse.transactions.items);
      }

      if (typeof cashFlowResponse.balance === "number") {
        setBalance(cashFlowResponse.balance);
      }

      setIsTransactionModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar transação:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar transação");
    }
  };

  const handleCreateCategory = async (data: {
    name: string;
    description: string;
  }) => {
    try {
      // Validar dados
      if (!data.name.trim()) {
        throw new Error("Nome da categoria é obrigatório");
      }

      await createCashFlowCategory(data);

      // Recarregar categorias
      const categoriesResponse = await getCashFlowCategories();
      setFinanceCategories(
        Array.isArray(categoriesResponse) ? categoriesResponse : []
      );
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error("❌ Erro ao criar categoria:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar categoria");
    }
  };

  const handleEditCategory = async (category: CashFlowCategory) => {
    try {
      const data = {
        name: category.name,
        description: category.description,
      };

      await updateCashFlowCategory(category.id, data);

      // Recarregar categorias
      const categoriesResponse = await getCashFlowCategories();
      setFinanceCategories(
        Array.isArray(categoriesResponse) ? categoriesResponse : []
      );
    } catch (err) {
      console.error("❌ Erro ao editar categoria:", err);
      setError(err instanceof Error ? err.message : "Erro ao editar categoria");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      // Verificar se a categoria ainda existe antes de tentar excluir
      const currentCategories = financeCategories.find((cat) => cat.id === id);
      if (!currentCategories) {
        console.warn(`⚠️ Categoria ID ${id} não encontrada na lista atual`);
        setError("Categoria não encontrada. A lista será atualizada.");

        // Recarregar categorias para sincronizar
        const categoriesResponse = await getCashFlowCategories();
        setFinanceCategories(
          Array.isArray(categoriesResponse) ? categoriesResponse : []
        );
        return;
      }

      // Verificar se a categoria está sendo usada em transações
      const categoryInUse = financeRecords.some(
        (record) => record.categoryId === id
      );
      if (categoryInUse) {
        setError(
          "Não é possível excluir esta categoria pois ela está sendo usada em transações existentes."
        );
        return;
      }

      await deleteCashFlowCategory(id);

      // Recarregar categorias
      const categoriesResponse = await getCashFlowCategories();
      setFinanceCategories(
        Array.isArray(categoriesResponse) ? categoriesResponse : []
      );

      // Mostrar mensagem de sucesso
      alert("✅ Categoria excluída com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao excluir categoria:", err);

      // Tratar diferentes tipos de erro
      let errorMessage = "Erro ao excluir categoria";

      if (err instanceof Error) {
        const errorText = err.message;

        if (
          errorText.includes(
            "expected to affect 1 row(s), but actually affected 0 row(s)"
          )
        ) {
          errorMessage =
            "Esta categoria já foi excluída ou não existe mais. A lista será atualizada.";

          // Recarregar categorias para sincronizar
          try {
            const categoriesResponse = await getCashFlowCategories();
            setFinanceCategories(
              Array.isArray(categoriesResponse) ? categoriesResponse : []
            );
          } catch (reloadErr) {
            console.error("Erro ao recarregar categorias:", reloadErr);
          }
        } else if (errorText.includes("foreign key constraint")) {
          errorMessage =
            "Não é possível excluir esta categoria pois ela está sendo usada em transações.";
        } else if (errorText.includes("401")) {
          errorMessage = "Sessão expirada. Faça login novamente.";
        } else if (errorText.includes("403")) {
          errorMessage = "Você não tem permissão para excluir esta categoria.";
        } else {
          errorMessage = `Erro: ${errorText}`;
        }
      }

      setError(errorMessage);
    }
  };

  const handleDeleteTransaction = (recordId: string) => {
    setRecordToDelete(recordId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTransaction = async () => {
    if (recordToDelete) {
      try {
        await deleteCashFlow(Number.parseInt(recordToDelete));

        // ✅ CORRIGIDO: Recarregar dados usando nova estrutura
        const cashFlowResponse = await getCashFlowList({
          pageNumber: 1,
          pageSize: 100,
        });

        if (cashFlowResponse.transactions?.items) {
          setFinanceRecords(cashFlowResponse.transactions.items);
        }

        if (typeof cashFlowResponse.balance === "number") {
          setBalance(cashFlowResponse.balance);
        }

        setRecordToDelete(null);
        setDeleteDialogOpen(false);
      } catch (err) {
        console.error("Erro ao excluir transação:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao excluir transação"
        );
      }
    }
  };

  const generatePDFReport = () => {
    alert("Funcionalidade de relatório será implementada");
  };

  // Funções de filtro com verificações de segurança
  const getFilteredRecords = () => {
    if (!Array.isArray(financeRecords)) return [];
    return financeRecords.filter((record) => {
      const typeMatch =
        filterType === "all" ||
        (filterType === "entrada" ? record.type === 0 : record.type === 1);
      const categoryMatch =
        filterCategory === "all" ||
        record.categoryId.toString() === filterCategory;

      let dateMatch = true;
      if (filterStartDate || filterEndDate) {
        const recordDate = new Date(record.date);
        if (filterStartDate) {
          const startDate = new Date(filterStartDate);
          dateMatch = dateMatch && recordDate >= startDate;
        }
        if (filterEndDate) {
          const endDate = new Date(filterEndDate);
          dateMatch = dateMatch && recordDate <= endDate;
        }
      }

      return typeMatch && categoryMatch && dateMatch;
    });
  };

  const getTotalEntradas = () => {
    return getFilteredRecords()
      .filter((record) => record.type === 0)
      .reduce((sum, record) => sum + (record.amount || 0), 0);
  };

  const getTotalSaidas = () => {
    return getFilteredRecords()
      .filter((record) => record.type === 1)
      .reduce((sum, record) => sum + (record.amount || 0), 0);
  };

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
    };
    return (
      colors[categoryName as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "pix":
        return "💳";
      case "cartao":
        return "💳";
      case "dinheiro":
        return "💵";
      case "transferencia":
        return "🏦";
      default:
        return "💰";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando dados financeiros...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          onGenerateReport={generatePDFReport}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onTestApi={handleTestAuth}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-sm font-medium text-red-600">
                  Erro: {error}
                </p>
                <Button
                  onClick={() => setError("")}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
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
              <Button onClick={() => setIsTransactionModalOpen(true)}>
                Nova Transação
              </Button>
              <Button
                onClick={() => setIsCategoryModalOpen(true)}
                variant="outline"
              >
                Gerenciar Categorias ({financeCategories.length})
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
              onEdit={handleOpenEditModal}
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
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTransaction}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <EditTransactionModal
        transaction={editingTransaction}
        categories={financeCategories}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleEditTransaction}
      />
    </div>
  );
}
