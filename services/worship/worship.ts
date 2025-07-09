import { authFetch, authFetchJson } from "@/lib/auth-fetch";
import { ReactNode } from "react";

// URL base da sua API.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

// --- Enums e Tipos ---

export enum WorshipStatus {
  NotStarted = 0,
  InProgress = 1,
  Finished = 2,
}

export interface PrayerRequest {
  memberName: any;
  id: number;
  request: string;
  createdAt: string;
}

export interface AdminNoticePayload {
  message: string;
  imageBase64?: string; // Opcional, caso não envie imagem
}

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

export interface PresentHymnParams {
  hymnNumber: number;
  verseNumber: number;
  previousVerseNumber?: number;
  nextVerseNumber?: number;
}

export interface PresentHymnResponse {
  activityId: number;
  presentationId: number;
  slideIndex: number;
  nextSlideIndex: number | null;
  previousSlideIndex: number | null;
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

// --- Classe de Serviço de Culto ---

class WorshipServiceManager {
  async sendAdminNotice(
    worshipServiceId: number,
    notice: AdminNoticePayload
  ): Promise<void> {
    await authFetch(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/admin-notice`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notice),
      }
    );
  }

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

  async listWorshipServices(
    params: ListWorshipServicesParams = {}
  ): Promise<{ items: WorshipService[] }> {
    const query = new URLSearchParams(params as any).toString();
    const response = await authFetchJson(
      `${API_BASE_URL}/Event/worship?${query}`
    );
    return response as { items: WorshipService[] };
  }

  async getWorshipById(id: number): Promise<WorshipService> {
    const response = await authFetchJson(`${API_BASE_URL}/Event/worship/${id}`);
    return response as WorshipService;
  }

  async startWorship(worshipServiceId: number): Promise<void> {
    await authFetch(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/start`,
      {
        method: "POST",
      }
    );
  }

  async finishWorship(worshipServiceId: number): Promise<void> {
    await authFetch(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/finish`,
      {
        method: "POST",
      }
    );
  }

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

  async presentHymn(
    worshipServiceId: number,
    params: PresentHymnParams
  ): Promise<PresentHymnResponse> {
    const { hymnNumber, verseNumber, previousVerseNumber, nextVerseNumber } =
      params;

    const queryParams: Record<string, string> = {};
    if (previousVerseNumber != null) {
      queryParams.previousVerseNumber = String(previousVerseNumber);
    }
    if (nextVerseNumber != null) {
      queryParams.nextVerseNumber = String(nextVerseNumber);
    }

    const queryString = new URLSearchParams(queryParams).toString();

    const url = `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/hymn/${hymnNumber}/present/${verseNumber}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await authFetchJson(url, {
      method: "POST",
    });

    return response as PresentHymnResponse;
  }

  async presentOffering(worshipServiceId: number): Promise<WorshipActivity> {
    const response = await authFetchJson(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/offering/present`,
      {
        method: "POST",
      }
    );
    return response as WorshipActivity;
  }

  async finishOffering(
    worshipServiceId: number,
    activityId: number
  ): Promise<void> {
    await authFetch(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/offering/${activityId}/finish`,
      {
        method: "POST",
      }
    );
  }

  async sendPrayerRequest(
    worshipServiceId: number,
    request: string
  ): Promise<void> {
    const payload = {
      worshipServiceId,
      request,
    };
    await authFetch(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/prayer-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async getPrayerRequests(worshipServiceId: number): Promise<PrayerRequest[]> {
    const response = await authFetchJson(
      `${API_BASE_URL}/WorshipActivity/${worshipServiceId}/prayer-requests/list`
    );
    return response as PrayerRequest[];
  }
}

export const worshipService = new WorshipServiceManager();

// --- Serviço da Bíblia (existente) ---

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
      const [versionData, bookData, versesData] = await Promise.all([
        authFetchJson(`${API_BASE_URL}/Bible/versions/${versionId}`),
        authFetchJson(`${API_BASE_URL}/Bible/books/${bookId}`),
        this.getVersesByChapterId(chapterId),
      ]);

      const book = bookData as BibleBook;
      const version = versionData as BibleVersion;
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

// --- Classe de Serviço de Hinos ---

export interface HymnSummary {
  number: number;
  title: string;
}

export interface HymnVerse {
  number: number;
  text: string;
}

export interface Hymn {
  id: number;
  title: string;
  number: number;
  language: string;
  chorus: string;
  lyricsAuthor: string;
  melodyAuthor: string;
  verses: HymnVerse[];
}

class HymnService {
  async getSummaries(): Promise<HymnSummary[]> {
    const response = await authFetchJson(`${API_BASE_URL}/Hymn/summaries`);
    return response as HymnSummary[];
  }

  async getHymn(hymnNumber: number): Promise<Hymn> {
    const response = await authFetchJson(`${API_BASE_URL}/Hymn/${hymnNumber}`);
    return response as Hymn;
  }
}

export const hymnService = new HymnService();
