import authFetch, { authFetchJson } from "@/lib/auth-fetch";

const API_BASE_URL = "https://demoapp.top1soft.com.br/api";

// --- Interfaces (sem alterações) ---
export interface MemberAddress {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  neighborhood: string;
}

export interface MemberDocument {
  id: number;
  memberId: number;
  type: number;
  number: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  maritalStatus: string;
  address: MemberAddress;
  document: MemberDocument[];
}

export interface PaginatedMembers {
  items: Member[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export async function getPendingMembers(): Promise<PaginatedMembers> {
  try {
    const data = await authFetchJson(
      `${API_BASE_URL}/Member?PendingApproval=true`
    );
    return data;
  } catch (error) {
    console.error("Erro ao buscar membros pendentes:", error);
    throw error;
  }
}

export async function approveMember(memberId: number): Promise<void> {
  try {
    await authFetch(`${API_BASE_URL}/Member/${memberId}/approve`, {
      method: "PUT",
    });
  } catch (error) {
    console.error(`Erro ao aprovar o membro ${memberId}:`, error);
    throw error;
  }
}

export async function declineMember(memberId: number): Promise<void> {
  try {
    await authFetch(`${API_BASE_URL}/Member/${memberId}/decline`, {
      method: "PUT",
    });
  } catch (error) {
    console.error(`Erro ao recusar o membro ${memberId}:`, error);
    throw error;
  }
}
