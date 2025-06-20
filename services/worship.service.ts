import { authFetch } from "@/lib/auth-fetch";

export interface BibleReference {
  id: number;
  bibleVersionId: number;
  bookId: number;
  chapterId: number;
  verseStart: number;
  verseEnd: number;
}

export interface Hymn {
  id: number;
  hymnId: number;
  hymnTitle: string;
  hymnNumber: string;
}

export interface Activity {
  id: number;
  name: string;
  content: string;
  order: number;
  isCurrent: boolean;
  bibles: BibleReference[];
  hymns: Hymn[];
}

export interface ScheduleItem {
  id: number;
  worshipServiceId: number;
  name: string;
  order: number;
}

export interface WorshipService {
  id: number;
  churchId: number;
  eventId: number;
  title: string;
  theme: string;
  startTime: string;
  endTime: string;
  description: string;
  status: number;
  activities: Activity[];
  schedule: ScheduleItem[];
  presencesCount: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export enum WorshipStatus {
  NotStarted = 0,
  InProgress = 1,
  Finished = 2,
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br";

export const worshipService = {
  async listWorshipServices(params: {
    status?: WorshipStatus;
    title?: string;
    theme?: string;
    startTime?: string;
    endTime?: string;
    onlyPast?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<WorshipService>> {
    // Construir query string
    const queryParams = new URLSearchParams();
    if (params.status !== undefined)
      queryParams.append("Status", params.status.toString());
    if (params.title) queryParams.append("Title", params.title);
    if (params.theme) queryParams.append("Theme", params.theme);
    if (params.startTime) queryParams.append("StartTime", params.startTime);
    if (params.endTime) queryParams.append("EndTime", params.endTime);
    if (params.onlyPast !== undefined)
      queryParams.append("OnlyPast", params.onlyPast.toString());
    if (params.page !== undefined)
      queryParams.append("Page", params.page.toString());
    if (params.pageSize !== undefined)
      queryParams.append("PageSize", params.pageSize.toString());

    const url = `${API_URL}/api/Event/worship${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    try {
      const response = await authFetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erro ao listar cultos: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Verificar o formato da resposta e extrair os dados corretamente
      if (Array.isArray(data) && data.length > 0) {
        // A API retorna um array com um objeto de paginação
        return (
          data[0] || {
            items: [],
            pageNumber: 0,
            pageSize: 0,
            totalCount: 0,
            totalPages: 0,
          }
        );
      } else if (data && data.items) {
        // A API retorna diretamente o objeto de paginação
        return data;
      } else {
        // Formato desconhecido, criar um objeto padrão
        console.warn("⚠️ Formato de resposta desconhecido:", data);
        return {
          items: Array.isArray(data) ? data : [],
          pageNumber: 0,
          pageSize: 0,
          totalCount: Array.isArray(data) ? data.length : 0,
          totalPages: 1,
        };
      }
    } catch (error) {
      console.error("❌ Erro ao listar cultos:", error);
      throw error;
    }
  },

  /**
   * Obtém cultos por status
   * @param status 0=não iniciados, 1=iniciados, 2=finalizados
   */
  async getWorshipByStatus(status: WorshipStatus): Promise<WorshipService[]> {
    try {
      const response = await this.listWorshipServices({
        status,
        pageSize: 50, // Buscar uma quantidade razoável de cultos
      });

      return response.items || [];
    } catch (error) {
      console.error(`❌ Erro ao buscar cultos com status ${status}:`, error);
      throw error;
    }
  },

  /**
   * Obtém detalhes de um culto específico
   * @param id ID do culto
   */
  async getWorshipDetails(id: number): Promise<WorshipService> {
    try {
      const response = await authFetch(`${API_URL}/api/Event/worship/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erro ao buscar detalhes do culto: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("❌ Erro ao buscar detalhes do culto:", error);
      throw error;
    }
  },

  /**
   * Inicia um culto
   * @param id ID do culto
   */
  async startWorship(id: number): Promise<boolean> {
    try {
      const response = await authFetch(
        `${API_URL}/api/Event/worship/start/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro ao iniciar culto: ${response.status} ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error("❌ Erro ao iniciar culto:", error);
      throw error;
    }
  },

  /**
   * Finaliza um culto
   * @param id ID do culto
   */
  async finishWorship(id: number): Promise<boolean> {
    try {
      const response = await authFetch(
        `${API_URL}/api/Event/worship/finish/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro ao finalizar culto: ${response.status} ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error("❌ Erro ao finalizar culto:", error);
      throw error;
    }
  },
};
