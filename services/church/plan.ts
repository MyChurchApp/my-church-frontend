import { authFetchJson } from "@/lib/auth-fetch";
const API_BASE_URL = "https://demoapp.top1soft.com.br";

// --- Tipos e Interfaces (permanecem os mesmos) ---

export interface Plan {
  id: number;
  name: string;
  price: number;
  maxMembers: number;
  maxEvents: number;
  maxStorageGB: number;
}

export interface ChangePlanResponse {
  success: boolean;
  message: string;
  chargedAmount?: number;
  paymentLink?: string;
  pixQrCode?: string;
  payload?: string;
}

export const getAvailablePlans = async (): Promise<Plan[]> => {
  const url = `${API_BASE_URL}/api/Plan`;
  try {
    // Usando sua função authFetchJson para a requisição GET
    const plans = await authFetchJson(url, { method: "GET" });
    return plans as Plan[]; // Fazendo a conversão de tipo para garantir a tipagem
  } catch (error) {
    console.error("Erro ao buscar planos disponíveis:", error);
    throw new Error("Não foi possível carregar os planos. Tente novamente.");
  }
};

export const changePlan = async (
  newPlanId: number
): Promise<ChangePlanResponse> => {
  const url = `${API_BASE_URL}/api/Subscription/change-plan`;
  const requestBody = { newPlanId };

  try {
    // Usando sua função authFetchJson para a requisição POST
    const response = await authFetchJson(url, {
      method: "POST",
      body: JSON.stringify(requestBody),
      // Não é necessário definir 'headers', pois authFetchJson já faz isso.
    });
    return response as ChangePlanResponse; // Fazendo a conversão de tipo
  } catch (error: any) {
    console.error("Erro ao alterar o plano:", error);
    // A sua função authFetchJson já formata bem o erro, podemos repassá-lo
    throw new Error(
      error.message || "Ocorreu um erro ao tentar alterar o plano."
    );
  }
};

export const cancelSubscription = async (
  subscriptionId: number
): Promise<any> => {
  const url = `${API_BASE_URL}/api/Subscription/${subscriptionId}`;

  try {
    // Usando sua função authFetchJson para a requisição DELETE
    // Uma resposta 200 ou 204 (No Content) será tratada como sucesso
    const response = await authFetchJson(url, {
      method: "DELETE",
    });
    return response || { success: true }; // Retorna sucesso mesmo se a resposta for vazia (204)
  } catch (error: any) {
    console.error("Erro ao cancelar a assinatura:", error);
    throw new Error(
      error.message || "Ocorreu um erro ao tentar cancelar a assinatura."
    );
  }
};
