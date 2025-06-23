import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMembersFromAPI, type ApiMember } from "@/lib/api";
import { getUserRole, isAuthenticated } from "@/lib/auth-utils";
import { useQuery } from "@tanstack/react-query";
import {
  getMemberCounts,
  MemberCountsResponse,
} from "@/services/member/MemberCounts";

export function useMembros() {
  const router = useRouter();
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ApiMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<ApiMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const userRole = getUserRole();
  const isAdmin = userRole === "Admin";

  // Faz a contagem de membros usando a API centralizada
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

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadMembers();
    // eslint-disable-next-line
  }, [router, currentPage]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMembersFromAPI(currentPage, pageSize);
      setMembers(response.items);
      setFilteredMembers(response.items);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      setError(
        "Erro ao carregar membros. Verifique sua conexão e tente novamente."
      );
      setMembers([]);
      setFilteredMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = members;
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((member) =>
        statusFilter === "active" ? member.isActive : !member.isActive
      );
    }
    setFilteredMembers(filtered);
  }, [members, searchTerm, statusFilter]);

  const handlePageChange = (page: number) => setCurrentPage(page);

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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

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
    filteredMembers,
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
