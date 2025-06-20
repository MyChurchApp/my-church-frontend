import { authFetch } from "@/lib/auth-fetch";

// Interface para dados da igreja
export interface Church {
  id: number;
  name: string;
  logo: string | null;
  address: {
    id: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    neighborhood: string;
  };
  phone: string;
  description: string;
  pastor?: string;
  email?: string;
  subscription?: {
    id: number;
    churchId: number;
    planId: number | null;
    isActive: boolean;
    startDate: string;
    endDate: string;
    payments: any[]; // ajuste se quiser tipar os pagamentos
    plan: {
      id: number;
      name: string;
      price: number;
      maxMembers: number;
      maxEvents: number;
      maxStorageGB: number;
    };
  };
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

// Função para obter dados da igreja
export const getChurchData = async (): Promise<Church> => {
  let churchId = 0;
  try {
    // Verificar se temos um token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          churchId = payload.churchId || 0;
        } catch (error) {
          console.error(
            "Erro ao decodificar token para obter churchId:",
            error
          );
        }
      }

      // Verificar se temos o churchId no localStorage
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.churchId) {
            churchId = userData.churchId;
          }
        } catch (error) {
          console.error(
            "Erro ao parsear dados do usuário para obter churchId:",
            error
          );
        }
      }
    }

    if (!churchId) {
      throw new Error("ID da igreja não encontrado");
    }

    // Fazer a requisição para a API
    const response = await authFetch(`${API_BASE_URL}/Church/${churchId}`);

    if (!response.ok) {
      throw new Error(`Erro ao obter dados da igreja: ${response.status}`);
    }

    const data = await response.json();

    // Adicionar campos extras que podem ser necessários na interface
    return {
      ...data,
      pastor: data.pastor || "",
      email: data.email || "",
    };
  } catch (error) {
    console.error("Erro ao obter dados da igreja:", error);

    // Retornar dados padrão em caso de erro
    return {
      id: 0,
      name: "",
      logo: null,
      address: {
        id: 0,
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        neighborhood: "",
      },
      phone: "",
      description: "",
      pastor: "",
      email: "",
    };
  }
};

// Função para atualizar dados da igreja
export const updateChurchData = async (
  churchData: Partial<Church>
): Promise<Church> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }

  if (!churchData.id) {
    throw new Error("ID da igreja é obrigatório para atualização");
  }

  const response = await fetch(`${API_BASE_URL}/Church/${churchData.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(churchData),
  });

  if (!response.ok) {
    throw new Error(`Erro ao atualizar dados da igreja: ${response.status}`);
  }

  return await response.json();
};

export const getChurchDashboardStats =
  async (): Promise<ChurchDashboardStats> => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticação não encontrado");

    const res = await fetch(`${API_BASE_URL}/Church/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 403) {
      const error = new Error("Forbidden");
      (error as any).status = 403;
      throw error;
    }

    if (!res.ok) {
      throw new Error(`Erro ao obter dashboard: ${res.status}`);
    }

    return res.json();
  };
