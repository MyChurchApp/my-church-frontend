import { authFetch } from "@/lib/auth-fetch";

export interface VerseOfDay {
  verseText: string;
  reference: string;
}

export class VerseOfDayService {
  private static readonly BASE_URL =
    "https://demoapp.top1soft.com.br/api/PastorBot";

  /**
   * Busca o versículo do dia da API
   */
  static async getVerseOfDay(): Promise<VerseOfDay> {
    try {

      const response = await authFetch(`${this.BASE_URL}/verseoftheday`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erro HTTP: ${response.status} - ${response.statusText}`
        );
      }

      const data: VerseOfDay = await response.json();

      return data;
    } catch (error) {
      console.error("❌ Erro ao buscar versículo do dia:", error);

      // Fallback para versículo padrão em caso de erro
      return {
        verseText:
          "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.",
        reference: "Jeremias 29:11",
      };
    }
  }

  /**
   * Testa a conexão com a API
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await authFetch(`${this.BASE_URL}/verseoftheday`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      console.warn("Conexão com API de versículos não disponível:", error);
      return false;
    }
  }

  /**
   * Formata o versículo para exibição
   */
  static formatVerse(verse: VerseOfDay): string {
    return `"${verse.verseText}" - ${verse.reference}`;
  }

  /**
   * Verifica se o versículo é válido
   */
  static isValidVerse(verse: VerseOfDay): boolean {
    return !!(
      verse.verseText &&
      verse.reference &&
      verse.verseText.trim().length > 0 &&
      verse.reference.trim().length > 0
    );
  }
}
