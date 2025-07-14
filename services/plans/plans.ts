const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";
const PLANS_ENDPOINT = `${API_BASE_URL}/Plan`;

export interface ApiPlan {
  id: number;
  name: string;
  price: number;
  maxMembers: number;
  maxEvents: number;
  maxStorageGB: number;
}

export async function getPlans(): Promise<ApiPlan[]> {
  const response = await fetch(PLANS_ENDPOINT);
  if (!response.ok) {
    throw new Error("Falha ao buscar os planos.");
  }
  return response.json();
}
