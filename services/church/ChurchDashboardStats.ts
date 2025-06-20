import { ChurchDashboardStats } from "./type";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

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

    if (res.status === 404) {
      const error = new Error("Not Found");
      (error as any).status = 404;
      throw error;
    }

    if (!res.ok) {
      const error = new Error(`Erro: ${res.status}`);
      (error as any).status = res.status;
      throw error;
    }

    return (await res.json()) as ChurchDashboardStats;
  };
