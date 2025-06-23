import { authFetchJson } from "@/lib/auth-fetch";
import { authFetch } from "@/lib/auth-fetch";

export type MemberCountsResponse = {
  total: number;
  totalActive: number;
  totalInactive: number;
};

export interface MemberFormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  isBaptized: boolean;
  baptizedDate: string;
  isTither: boolean;
  maritalStatus: string;
  memberSince: string;
  ministry: string;
  isActive: boolean;
  notes: string;
  photo: string;
  cpf: string;
  rg: string;
}

export interface MemberApiData {
  name: string;
  email: string;
  phone: string;
  birthDate: string | null;
  isBaptized: boolean;
  baptizedDate: string | null;
  isTither: boolean;
  maritalStatus: number;
  memberSince: string | null;
  ministry: number;
  isActive: boolean;
  notes: string;
  photo: string;
  documents: Array<{
    type: number;
    number: string;
  }>;
}

export class MembersEditService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

  static async updateMember(
    memberId: number,
    data: MemberApiData
  ): Promise<any> {
    const response = await authFetch(
      `${this.API_BASE_URL}/Member/${memberId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erro ao atualizar membro: ${response.status} - ${errorText}`
      );
    }

    return response.json();
  }

  static convertApiDataToForm(member: any): MemberFormData {
    // Extrair CPF e RG dos documentos
    const cpfDoc = member.document?.find((doc: any) => doc.type === 1);
    const rgDoc = member.document?.find((doc: any) => doc.type === 2);

    return {
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      birthDate: member.birthDate ? member.birthDate.split("T")[0] : "",
      isBaptized: member.isBaptized || false,
      baptizedDate: member.baptizedDate
        ? member.baptizedDate.split("T")[0]
        : "",
      isTither: member.isTither || false,
      maritalStatus: this.getMaritalStatusValue(member.maritalStatus),
      memberSince: member.memberSince ? member.memberSince.split("T")[0] : "",
      ministry: this.getMinistryValue(member.ministry),
      isActive: member.isActive !== undefined ? member.isActive : true,
      notes: member.notes || "",
      photo: member.photo || "",
      cpf: cpfDoc?.number || "",
      rg: rgDoc?.number || "",
    };
  }

  static convertFormDataToApi(
    formData: MemberFormData,
    existingDocuments: any[] = []
  ): MemberApiData {
    const documents: Array<{ type: number; number: string }> = [];

    // Adicionar CPF se preenchido
    if (formData.cpf.trim()) {
      documents.push({
        type: 1, // CPF
        number: formData.cpf.replace(/\D/g, ""), // Remove formatação
      });
    }

    // Adicionar RG se preenchido
    if (formData.rg.trim()) {
      documents.push({
        type: 2, // RG
        number: formData.rg.replace(/\D/g, ""), // Remove formatação
      });
    }

    // Se não há novos documentos, manter os existentes
    if (documents.length === 0 && existingDocuments?.length > 0) {
      existingDocuments.forEach((doc) => {
        documents.push({
          type: doc.type,
          number: doc.number,
        });
      });
    }

    return {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      birthDate: formData.birthDate
        ? new Date(formData.birthDate).toISOString()
        : null,
      isBaptized: formData.isBaptized,
      baptizedDate: formData.baptizedDate
        ? new Date(formData.baptizedDate).toISOString()
        : null,
      isTither: formData.isTither,
      maritalStatus: Number.parseInt(formData.maritalStatus) || 0,
      memberSince: formData.memberSince
        ? new Date(formData.memberSince).toISOString()
        : null,
      ministry: Number.parseInt(formData.ministry) || 0,
      isActive: formData.isActive,
      notes: formData.notes,
      photo: formData.photo,
      documents,
    };
  }

  static getMaritalStatusOptions() {
    return [
      { value: "0", label: "Solteiro(a)" },
      { value: "1", label: "Casado(a)" },
      { value: "2", label: "Divorciado(a)" },
      { value: "3", label: "Viúvo(a)" },
      { value: "4", label: "União Estável" },
    ];
  }

  static getMinistryOptions() {
    return [
      { value: "0", label: "Nenhum" },
      { value: "1", label: "Louvor" },
      { value: "2", label: "Ensino" },
      { value: "3", label: "Evangelismo" },
      { value: "4", label: "Intercessão" },
      { value: "5", label: "Diaconia" },
      { value: "6", label: "Infantil" },
      { value: "7", label: "Jovens" },
      { value: "8", label: "Casais" },
      { value: "9", label: "Idosos" },
      { value: "10", label: "Administração" },
    ];
  }

  private static getMaritalStatusValue(status: any): string {
    if (typeof status === "number") {
      return status.toString();
    }
    if (typeof status === "string") {
      // Mapear strings para números se necessário
      const statusMap: { [key: string]: string } = {
        Solteiro: "0",
        Solteira: "0",
        Casado: "1",
        Casada: "1",
        Divorciado: "2",
        Divorciada: "2",
        Viúvo: "3",
        Viúva: "3",
        "União Estável": "4",
      };
      return statusMap[status] || "0";
    }
    return "0";
  }

  private static getMinistryValue(ministry: any): string {
    if (typeof ministry === "number") {
      return ministry.toString();
    }
    if (typeof ministry === "string") {
      // Mapear strings para números se necessário
      const ministryMap: { [key: string]: string } = {
        Louvor: "1",
        Ensino: "2",
        Evangelismo: "3",
        Intercessão: "4",
        Diaconia: "5",
        Infantil: "6",
        Jovens: "7",
        Casais: "8",
        Idosos: "9",
        Administração: "10",
      };
      return ministryMap[ministry] || "0";
    }
    return "0";
  }
}

export async function getMemberCounts(): Promise<MemberCountsResponse> {
  const data = await authFetchJson(
    "https://demoapp.top1soft.com.br/api/Member/counts",
    {
      headers: {
        Accept: "text/plain",
      },
    }
  );

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      throw new Error("Resposta inválida da API");
    }
  }
  return data;
}

// Enum para tipos de documento
export enum DocumentType {
  CPF = 1,
  RG = 2,
  TituloEleitor = 3,
  CNH = 4,
  CertidaoNascimento = 5,
  Outros = 99,
}

// Interfaces
export interface ApiMember {
  address: any;
  id: number;
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  birthDate: string;
  isBaptized: boolean;
  baptizedDate: string;
  isTither: boolean;
  churchId: number;
  role: number;
  created: string;
  updated: string | null;
  maritalStatus: string | null;
  memberSince: string | null;
  ministry: string | null;
  isActive: boolean;
  notes: string | null;
  document: Array<{
    id: number;
    memberId: number;
    type: number;
    number: string;
  }>;
  church?: any;
}

export interface ApiMembersResponse {
  items: ApiMember[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Configuração base
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

// Helpers
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

const handleApiError = (status: number, errorText: string) => {
  if (status === 500) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("api-error-500", {
          detail: {
            message:
              "Não foi possível completar a operação no momento. Tente novamente mais tarde.",
          },
        })
      );
    }
    throw new Error("Erro interno do servidor");
  } else if (status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Sessão expirada. Redirecionando para login...");
  } else if (status === 400) {
    throw new Error("Dados inválidos. Verifique os campos obrigatórios.");
  } else if (status === 404) {
    throw new Error("Recurso não encontrado.");
  } else {
    throw new Error(`Erro na API: ${status} - ${errorText}`);
  }
};

// ===============================
// CRUD PRINCIPAL (com filtros)
// ===============================
// ...demais exports

export type MemberFilters = Partial<{
  Name: string;
  Email: string;
  Document: string;
  IsBaptized: boolean;
  IsActive: boolean;
  Ministry: string;
  MaritalStatus: string;
  MemberSince: string;
  Notes: string;
}>;

export async function getMembersFromAPI(
  page = 1,
  pageSize = 10,
  filters: MemberFilters = {}
): Promise<ApiMembersResponse> {
  try {
    const params = new URLSearchParams({
      PageNumber: String(page),
      PageSize: String(pageSize),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "")
      ),
    });

    const url = `${API_BASE_URL}/Member?${params.toString()}`;
    const response = await authFetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(response.status, errorText);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar membros da API:", error);
    throw error;
  }
}

export async function createMemberAPI(memberData: any): Promise<ApiMember> {
  try {
    const response = await authFetchJson(`${API_BASE_URL}/Member`, {
      method: "POST",
      body: JSON.stringify(memberData),
    });
    return response as ApiMember;
  } catch (error) {
    console.error("Erro ao criar membro:", error);
    throw error;
  }
}

export async function updateMemberAPI(
  memberId: number,
  memberData: any
): Promise<ApiMember> {
  try {
    const response = await authFetchJson(`${API_BASE_URL}/Member/${memberId}`, {
      method: "PUT",
      body: JSON.stringify(memberData),
    });
    return response as ApiMember;
  } catch (error) {
    console.error("Erro ao atualizar membro:", error);
    throw error;
  }
}

export async function deleteMemberAPI(memberId: number): Promise<boolean> {
  try {
    const response = await authFetch(`${API_BASE_URL}/Member/${memberId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(response.status, errorText);
    }
    return response.ok;
  } catch (error) {
    console.error("Erro ao deletar membro:", error);
    throw error;
  }
}

// ===============================
// Helpers/conversores
// ===============================
export const convertApiMemberToLocal = (apiMember: ApiMember) => {
  const documents = apiMember?.document || [];
  const cpfDocument = documents.find(
    (doc: any) => doc.type === DocumentType.CPF
  );
  const rgDocument = documents.find((doc: any) => doc.type === DocumentType.RG);

  return {
    id: apiMember.id.toString(),
    name: apiMember.name || "",
    email: apiMember.email || "",
    phone: apiMember.phone || "",
    cpf: cpfDocument?.number || "",
    rg: rgDocument?.number || "",
    birthDate: apiMember.birthDate ? apiMember.birthDate.split("T")[0] : "",
    address: apiMember.address?.street || "",
    city: apiMember.address?.city || "",
    state: apiMember.address?.state || "",
    zipCode: apiMember.address?.zipCode || "",
    maritalStatus: apiMember.maritalStatus || "",
    baptized: Boolean(apiMember.isBaptized),
    memberSince: apiMember.memberSince
      ? apiMember.memberSince.split("T")[0]
      : "",
    ministry: apiMember.ministry || "",
    photo: apiMember.photo || "",
    isActive: Boolean(apiMember.isActive),
    notes: apiMember.notes || "",
  };
};

export const convertLocalMemberToApi = (localMember: any) => {
  return {
    name: localMember.name?.trim() || "",
    email: localMember.email?.trim() || "",
    document: localMember.document?.trim() || "",
    photo: localMember.photo || "",
    phone: localMember.phone?.trim() || "",
    birthDate: localMember.birthDate
      ? `${localMember.birthDate}T00:00:00`
      : "1990-01-01T00:00:00",
    isBaptized: Boolean(localMember.isBaptized),
    baptizedDate: localMember.baptizedDate
      ? `${localMember.baptizedDate}T00:00:00`
      : "2023-10-14T00:00:00",
    isTither: Boolean(localMember.isTither),
    maritalStatus: localMember.maritalStatus || "",
    memberSince: localMember.memberSince
      ? `${localMember.memberSince}T00:00:00`
      : "2020-01-01T00:00:00",
    ministry: localMember.ministry || "",
    isActive:
      localMember.isActive !== undefined ? Boolean(localMember.isActive) : true,
    notes: localMember.notes || "",
  };
};

// ===============================
// Auth e utilidades
// ===============================
export const isAuthenticated = (): boolean => !!getAuthToken();

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Agora mesmo";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h atrás`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d atrás`;
  } else {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
};

export const getCurrentUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.nameid || payload.sub || payload.id || null;
  } catch (error) {
    console.error("Erro ao decodificar token para obter ID:", error);
    return null;
  }
};
