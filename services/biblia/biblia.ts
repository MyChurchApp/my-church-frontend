// O URL base da sua API
const API_URL = "https://demoapp.top1soft.com.br";

// --- Interfaces e Tipos (sem alterações) ---

export interface GeminiModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    explanation: string;
    context: string;
    application: string;
  } | null;
  isLoading?: boolean;
}

export type BibleVersion = {
  id: number;
  name: string;
  abbreviation: string;
  language: string;
  description: string;
  publisher: string;
  publicationYear: number;
};

export interface TooltipState {
  verseId: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  verseText: string;
  verseReference: string;
}

export type BibleBook = {
  id: number;
  name: string;
  abbreviation: string;
  order: number;
  testament: string;
};

export type BibleChapter = {
  id: number;
  chapterNumber: number;
};

export type BibleVerse = {
  id: number;
  verseNumber: number;
  text: string;
};

type ExplainVerseResponse = {
  explanation: string;
  context: string;
  application: string;
};

// --- Funções de Fetch (Refatoradas) ---

// 1. Nova função para chamadas públicas (sem token)
async function fetchPublicAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "force-cache", // Recomenda-se cache agressivo para dados que não mudam
  });
  if (!res.ok) {
    throw new Error(`Erro na API pública: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// 2. Função para chamadas autenticadas (com token)
async function fetchAuthenticatedAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Erro na API autenticada: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// --- Objeto do Serviço (Atualizado) ---

export const bibleService = {
  // Funções que agora usam a chamada pública
  getVersions(): Promise<BibleVersion[]> {
    return fetchPublicAPI<BibleVersion[]>("/api/Bible/versions");
  },

  getBooksByVersion(versionId: number): Promise<BibleBook[]> {
    return fetchPublicAPI<BibleBook[]>(
      `/api/Bible/versions/${versionId}/books`
    );
  },

  getChaptersByBookId(bookId: number): Promise<BibleChapter[]> {
    return fetchPublicAPI<BibleChapter[]>(
      `/api/Bible/books/${bookId}/chapters`
    );
  },

  getChaptersByBookName(
    versionId: number,
    bookName: string
  ): Promise<BibleChapter[]> {
    return fetchPublicAPI<BibleChapter[]>(
      `/api/Bible/versions/${versionId}/books/${bookName}/chapters`
    );
  },

  getVerseByChapterAndNumber(
    chapterId: number,
    verseNumber: number
  ): Promise<BibleVerse> {
    return fetchPublicAPI<BibleVerse>(
      `/api/Bible/chapters/${chapterId}/verses/${verseNumber}`
    );
  },

  getVersesByChapterId(chapterId: number): Promise<BibleVerse[]> {
    return fetchPublicAPI<BibleVerse[]>(
      `/api/Bible/chapters/${chapterId}/verses`
    );
  },

  getVersesByReference(
    versionId: number,
    bookName: string,
    chapterNumber: number
  ): Promise<BibleVerse[]> {
    return fetchPublicAPI<BibleVerse[]>(
      `/api/Bible/versions/${versionId}/books/${bookName}/chapters/${chapterNumber}/verses`
    );
  },

  // Função que CONTINUA usando a chamada autenticada
  explainWithGemini: (
    verseText: string,
    verseReference: string
  ): Promise<ExplainVerseResponse> => {
    return fetchAuthenticatedAPI<ExplainVerseResponse>(
      "/api/PastorBot/explainverse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          verseReference,
          verseText,
        }),
      }
    );
  },
};
