import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  type ApiMember,
  getMembersFromAPI,
  isAuthenticated,
  getMemberCounts,
  type MemberCountsResponse,
} from "@/services/member/MemberCounts";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/auth-utils";

// Filtros disponíveis
type SearchType = "Name" | "Email" | "Document";

export function useMembros() {
  const router = useRouter();

  // Estado principal
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [searchType, setSearchType] = useState<SearchType>("Name");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all", "active", "inactive"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<ApiMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const userRole = getUser();
  const isAdmin = userRole === "Admin";

  // Contagem dos membros (React Query)
  const {
    data: memberCounts,
    isLoading: isLoadingCounts,
    error: errorCounts,
    refetch: refetchCounts,
  } = useQuery<MemberCountsResponse>({
    queryKey: ["member-counts"],
    queryFn: getMemberCounts,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Carregar membros sempre que filtro/página mudar
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadMembers();
    // eslint-disable-next-line
  }, [router, currentPage, searchType, searchTerm, statusFilter]);

  // Carrega da API conforme filtros
  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Monta filtros para a API
      const filters: any = {};
      if (searchTerm) filters[searchType] = searchTerm;
      if (statusFilter !== "all") filters.IsActive = statusFilter === "active";

      const response = await getMembersFromAPI(currentPage, pageSize, filters);
      setMembers(response.items);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      setError(
        "Erro ao carregar membros. Verifique sua conexão e tente novamente."
      );
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Paginação
  const handlePageChange = (page: number) => setCurrentPage(page);

  // Edição
  const handleEditMember = (member: ApiMember) => {
    setEditingMember(member);
    setShowEditModal(true);
  };
  const handleMemberUpdated = () => {
    setShowEditModal(false);
    setEditingMember(null);
    loadMembers();
    refetchCounts();
  };

  // Helper para pegar iniciais
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // Helper para formatar CPF
  const formatDocument = (documents: any[]) => {
    if (!documents || documents.length === 0) return "N/A";
    const cpf = documents.find((doc) => doc.type === 1);
    if (cpf) {
      const number = cpf.number;
      return number.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return documents[0]?.number || "N/A";
  };

  return {
    members,
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    isAdmin,
    handleEditMember,
    showEditModal,
    setShowEditModal,
    editingMember,
    handleMemberUpdated,
    handlePageChange,
    currentPage,
    totalPages,
    getInitials,
    formatDocument,
    loadMembers,
    memberCounts,
    isLoadingCounts,
    errorCounts,
  };
}
