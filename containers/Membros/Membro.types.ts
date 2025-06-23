import { ApiMember } from "@/lib/api";
import { MemberCountsResponse } from "@/services/member/MemberCounts";

export type MembrosPageProps = {
  members: ApiMember[]; // renomeado
  searchType: "Name" | "Email" | "Document";
  setSearchType: (v: "Name" | "Email" | "Document") => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  handleEditMember: (member: ApiMember) => void;
  showEditModal: boolean;
  setShowEditModal: (v: boolean) => void;
  editingMember: ApiMember | null;
  handleMemberUpdated: () => void;
  handlePageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  getInitials: (name: string) => string;
  formatDocument: (documents: any[]) => string;
  loadMembers: () => void;
  memberCounts?: MemberCountsResponse;
  isLoadingCounts: boolean;
};
