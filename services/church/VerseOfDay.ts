import { authFetch } from "@/lib/auth-fetch";
import { VerseType } from "./type";

export class VerseOfDay {
  private static readonly BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

  static async getVerseOfDay(): Promise<VerseType> {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      if (!token) throw new Error("Token de autenticação não encontrado");

      const response = await fetch(`${this.BASE_URL}/PastorBot/verseoftheday`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Erro ao buscar versículo:", err);
      throw err;
    }
  }
}
