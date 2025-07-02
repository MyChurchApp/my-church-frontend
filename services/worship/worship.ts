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
  Status?: WorshipStatus;
}

// --- Classe de Serviço ---

class WorshipServiceManager {
  /**
   * Encontra o primeiro culto que está ativo (Status = 1).
   */
  async findActiveWorshipService(): Promise<WorshipService | null> {
    const params = { Status: WorshipStatus.InProgress, pageSize: 1 };
    const query = new URLSearchParams(params as any).toString();
    const response = await authFetchJson(
      `${API_BASE_URL}/Event/worship?${query}`
    );

    if (response && response.items && response.items.length > 0) {
      return response.items[0];
    }
    return null;
  }

  /**
   * Lista todos os cultos disponíveis.
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
   */
  async getWorshipById(id: number): Promise<WorshipService> {
    const response = await authFetchJson(`${API_BASE_URL}/Event/worship/${id}`);
    return response as WorshipService;
  }

  /**
   * Inicia um culto.
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
   */
  async addScheduleItem(
    worshipServiceId: number,
    item: { name: string; order: number }
  ): Promise<WorshipScheduleItem> {
    const payload = { ...item, worshipServiceId };
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
   */
  async updateScheduleItem(
    worshipServiceId: number,
    itemId: number,
    item: { id: number; name: string; order: number }
  ): Promise<void> {
    const payload = { ...item, worshipServiceId };
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

  /**
   * Destaca uma leitura bíblica, notificando os membros.
   */
  async highlightBibleReading(
    worshipServiceId: number,
    params: {
      versionId: number;
      bookId: number;
      chapterId: number;
      verseId: number;
    }
  ): Promise<void> {
    const query = new URLSearchParams(params as any).toString();
    await authFetch(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/bible-reading/highlight?${query}`,
      {
        method: "POST",
      }
    );
  }
}

export const worshipService = new WorshipServiceManager();

export interface BibleVersion {
  id: number;
  name: string;
}
export interface BibleBook {
  id: number;
  name: string;
  testament: string;
}
export interface BibleChapter {
  id: number;
  chapterNumber: number;
}
export interface BibleVerse {
  id: number;
  verseNumber: number;
  text: string;
}

export interface FullReadingData {
  versionName: string;
  bookName: string;
  chapterNumber: number;
  verses: BibleVerse[];
}

class BibleService {
  async getVersions(): Promise<BibleVersion[]> {
    const response = await authFetchJson(`${API_BASE_URL}/Bible/versions`);
    return response as BibleVersion[];
  }

  async getBooksByVersion(versionId: number): Promise<BibleBook[]> {
    const response = await authFetchJson(
      `${API_BASE_URL}/Bible/versions/${versionId}/books`
    );
    return response as BibleBook[];
  }

  async getChaptersByBookId(bookId: number): Promise<BibleChapter[]> {
    const response = await authFetchJson(
      `${API_BASE_URL}/Bible/books/${bookId}/chapters`
    );
    return response as BibleChapter[];
  }

  async getVersesByChapterId(chapterId: number): Promise<BibleVerse[]> {
    const response = await authFetchJson(
      `${API_BASE_URL}/Bible/chapters/${chapterId}/verses`
    );
    return response as BibleVerse[];
  }

  async getReadingData({
    versionId,
    bookId,
    chapterId,
  }: {
    versionId: number;
    bookId: number;
    chapterId: number;
  }): Promise<FullReadingData> {
    try {
      // Faz as chamadas em paralelo para otimizar
      const [versionData, bookData, versesData] = await Promise.all([
        authFetchJson(`${API_BASE_URL}/Bible/versions/${versionId}`),
        authFetchJson(`${API_BASE_URL}/Bible/books/${bookId}`),
        this.getVersesByChapterId(chapterId),
      ]);

      const book = bookData as BibleBook;
      const version = versionData as BibleVersion;
      // Precisamos do número do capítulo, que pode não vir no payload, então buscamos a info do capítulo
      const chapterInfo = await authFetchJson(
        `${API_BASE_URL}/Bible/chapters/${chapterId}`
      );

      return {
        versionName: version.name,
        bookName: book.name,
        chapterNumber: chapterInfo.chapterNumber,
        verses: versesData,
      };
    } catch (error) {
      console.error("Erro ao buscar dados completos da leitura:", error);
      throw new Error("Não foi possível carregar o texto da leitura.");
    }
  }
}

export const bibleService = new BibleService();
