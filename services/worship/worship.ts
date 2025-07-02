import { authFetch, authFetchJson } from "@/lib/auth-fetch";

// URL base da sua API.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

// --- Enums e Tipos ---

export enum WorshipStatus {
  NotStarted = 0,
  InProgress = 1,
  Finished = 2,
}

// Interfaces detalhadas para a resposta de getWorshipById
export interface BibleReference {
  id: number;
  bibleVersionId: number;
  bookId: number;
  chapterId: number;
  verseStart: number;
  verseEnd: number;
}

export interface HymnReference {
  id: number;
  hymnId: number;
  hymnTitle: string;
  hymnNumber: string;
}

export interface WorshipActivity {
  id: number;
  name: string;
  content: string;
  order: number;
  isCurrent: boolean;
  bibles: BibleReference[];
  hymns: HymnReference[];
}

export interface WorshipScheduleItem {
  id: number;
  worshipServiceId: number;
  name: string;
  order: number;
}

// Interface principal do Culto, agora mais completa
export interface WorshipService {
  id: number;
  churchId: number;
  eventId: number;
  title: string;
  theme: string;
  startTime: string;
  endTime: string;
  description: string;
  status: WorshipStatus;
  activities: WorshipActivity[];
  schedule: WorshipScheduleItem[];
  presencesCount: number;
}

interface ListWorshipServicesParams {
  page?: number;
  pageSize?: number;
}

// --- Classe de Serviço ---

class WorshipServiceManager {
  /**
   * Lista todos os cultos disponíveis.
   * GET /api/Event/worship
   */
  async listWorshipServices(
    params: ListWorshipServicesParams = {}
  ): Promise<{ items: WorshipService[] }> {
    const query = new URLSearchParams(params as any).toString();
    const response = await authFetchJson(
      `${API_BASE_URL}/Event/worship?${query}`
    );
    return response as { items: WorshipService[] };
  }

  /**
   * Busca um culto (WorshipService) por ID.
   * GET /api/Event/worship/{id}
   */
  async getWorshipById(id: number): Promise<WorshipService> {
    const response = await authFetchJson(`${API_BASE_URL}/Event/worship/${id}`);
    return response as WorshipService;
  }

  /**
   * Inicia um culto.
   * POST /api/WorshipActivity/{worshipServiceId}/start
   */
  async startWorship(worshipServiceId: number): Promise<void> {
    await authFetch(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/start`,
      {
        method: "POST",
      }
    );
  }

  /**
   * Finaliza um culto.
   * POST /api/WorshipActivity/{worshipServiceId}/finish (Endpoint suposto)
   */
  async finishWorship(worshipServiceId: number): Promise<void> {
    await authFetch(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/finish`,
      {
        method: "POST",
      }
    );
  }

  /**
   * Adiciona um item ao cronograma do culto.
   * POST /api/WorshipActivity/{worshipServiceId}/schedule/add
   */
  async addScheduleItem(
    worshipServiceId: number,
    item: { name: string; order: number }
  ): Promise<WorshipScheduleItem> {
    const payload = { ...item, worshipServiceId }; // Garante que o ID do culto está no corpo, se necessário
    const response = await authFetchJson(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/schedule/add`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return response as WorshipScheduleItem;
  }

  /**
   * Atualiza um item do cronograma do culto.
   * PUT /api/WorshipActivity/{worshipServiceId}/schedule/update/{id}
   */
  async updateScheduleItem(
    worshipServiceId: number,
    itemId: number,
    item: { id: number; name: string; order: number }
  ): Promise<void> {
    const payload = { ...item, worshipServiceId }; // Garante que o ID do culto está no corpo, se necessário
    await authFetch(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/schedule/update/${itemId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * Remove um item do cronograma do culto.
   * DELETE /api/WorshipActivity/{worshipServiceId}/schedule/remove/{id}
   */
  async removeScheduleItem(
    worshipServiceId: number,
    itemId: number
  ): Promise<void> {
    await authFetch(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/schedule/remove/${itemId}`,
      {
        method: "DELETE",
      }
    );
  }
}

export const worshipService = new WorshipServiceManager();
