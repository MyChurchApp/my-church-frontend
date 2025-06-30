import { authFetch } from "@/lib/auth-fetch";
import { getUser } from "@/lib/auth-utils";

export interface BankingInfo {
  bankName: string;
  agency: string;
  account: string;
  accountDigit: string;
  accountType: string;
  holderName: string;
  holderDocument: string;
  pixKey: string;
  pixKeyType: string;
}

export interface MemberDocument {
  id: number;
  memberId: number;
  type: number;
  number: string;
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  neighborhood: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  birthDate: string;
  isBaptized: boolean;
  baptizedDate: string | null;
  isTither: boolean;
  churchId: number;
  role: number;
  created: string;
  updated: string;
  maritalStatus: string;
  memberSince: string;
  ministry: string;
  isActive: boolean;
  notes: string | null;
  address: Address;
  document: MemberDocument[];
}

export interface Payment {
  id: number;
  subscriptionId: number;
  amount: number;
  date: string;
  paymentStatus: string;
  transactionId: string;
}

export interface Church {
  id: number;
  name: string;
  logo: string | null;
  description: string;
  phone: string;
  address: Address;
  members: Member[];
  bankingInfo: BankingInfo | null;
  subscription: {
    id: number;
    churchId: number;
    planId: number | null;
    isActive: boolean;
    startDate: string;
    endDate: string;
    payments: Payment[];
    plan: {
      id: number;
      name: string;
      price: number;
      maxMembers: number;
      maxEvents: number;
      maxStorageGB: number;
    };
  } | null;
  pastor?: string;
  email?: string;
}

export interface ChurchDashboardStats {
  totalActiveMembers: number;
  totalEvents: number;
  currentBalance: number;
  memberGrowthPercent: number;
  eventGrowthPercent: number;
  financialGrowthPercent: number;
  averageDonationTicket: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

export const getChurchData = async (): Promise<Church> => {
  try {
    const user = getUser();
    const churchId = user?.churchId;

    if (!churchId) {
      throw new Error("ID da igreja não encontrado nos dados do usuário.");
    }

    const response = await authFetch(`${API_BASE_URL}/Church/${churchId}`);

    if (!response.ok) {
      throw new Error(
        `Erro na API ao obter dados da igreja: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Falha detalhada em getChurchData:", error);
    throw error;
  }
};

export const updateChurchData = async (
  churchData: Partial<Church>
): Promise<Church> => {
  if (!churchData.id) {
    throw new Error("O ID da igreja é obrigatório para a atualização.");
  }

  const payload = { ...churchData };

  if (payload.logo && !payload.logo.startsWith("data:image")) {
    payload.logo = null;
  }

  // REMOVIDO: Removemos os dados bancários do payload principal.
  delete (payload as any).bankingInfo;
  delete (payload as any).members;
  delete (payload as any).subscription;

  console.log(
    "Enviando payload principal para a API:",
    JSON.stringify(payload, null, 2)
  );

  const response = await authFetch(`${API_BASE_URL}/Church/${payload.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Erro retornado pela API (updateChurchData):", errorBody);
    throw new Error(
      `Erro ao atualizar dados da igreja: ${
        response.statusText || "Erro do Servidor"
      }`
    );
  }

  return await response.json();
};

/**
 * NOVO: Função para atualizar apenas os dados bancários.
 */
export const updateBankingInfo = async (
  bankingData: BankingInfo
): Promise<BankingInfo> => {
  const payload = {
    bankName: bankingData.bankName,
    agency: bankingData.agency,
    account: bankingData.account,
    accountDigit: bankingData.accountDigit,
    accountType: bankingData.accountType,
    holderName: bankingData.holderName,
    holderDocument: bankingData.holderDocument,
    pixKey: bankingData.pixKey,
    pixKeyType: bankingData.pixKeyType,
  };

  console.log(
    "Enviando dados bancários CORRIGIDOS para a API:",
    JSON.stringify(payload, null, 2)
  );

  const response = await authFetch(`${API_BASE_URL}/Church/banking-info`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // Envia o payload corrigido
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Erro retornado pela API (updateBankingInfo):", errorBody);
    throw new Error(
      `Erro ao atualizar dados bancários: ${
        response.statusText || "Erro do Servidor"
      }`
    );
  }

  return await response.json();
};

export const getChurchDashboardStats =
  async (): Promise<ChurchDashboardStats> => {
    const response = await authFetch(`${API_BASE_URL}/Church/dashboard`);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Acesso negado para obter estatísticas do dashboard.");
      }
      throw new Error(
        `Erro ao obter estatísticas do dashboard: ${response.statusText}`
      );
    }

    return response.json();
  };
