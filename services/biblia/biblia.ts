const API_URL = "https://demoapp.top1soft.com.br";

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

// Função utilitária para pegar o token do localStorage
function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Token JWT não encontrado no localStorage");
  return token;
}

// Função genérica de fetch
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
  return res.json();
}

export const bibleService = {
  // 1. Lista todas as versões
  getVersions(): Promise<BibleVersion[]> {
    return fetchAPI<BibleVersion[]>("/api/Bible/versions");
  },

  // 2. Lista todos os livros de uma versão
  getBooksByVersion(versionId: number): Promise<BibleBook[]> {
    return fetchAPI<BibleBook[]>(`/api/Bible/versions/${versionId}/books`);
  },

  // 3. Lista todos os capítulos de um livro por ID
  getChaptersByBookId(bookId: number): Promise<BibleChapter[]> {
    return fetchAPI<BibleChapter[]>(`/api/Bible/books/${bookId}/chapters`);
  },

  // 4. Lista todos os capítulos de um livro por versão e abreviação do livro
  getChaptersByBookName(
    versionId: number,
    bookName: string
  ): Promise<BibleChapter[]> {
    return fetchAPI<BibleChapter[]>(
      `/api/Bible/versions/${versionId}/books/${bookName}/chapters`
    );
  },

  // 5. Retorna UM versículo específico de um capítulo
  getVerseByChapterAndNumber(
    chapterId: number,
    verseNumber: number
  ): Promise<BibleVerse> {
    return fetchAPI<BibleVerse>(
      `/api/Bible/chapters/${chapterId}/verses/${verseNumber}`
    );
  },

  // 6. Lista todos os versículos de um capítulo (por ID de capítulo)
  getVersesByChapterId(chapterId: number): Promise<BibleVerse[]> {
    return fetchAPI<BibleVerse[]>(`/api/Bible/chapters/${chapterId}/verses`);
  },

  // Implementação real usando o endpoint da API PastorBot
  explainWithGemini: async (
    verseText: string,
    verseReference: string
  ): Promise<ExplainVerseResponse> => {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/api/PastorBot/explainverse`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        verseReference,
        verseText,
      }),
    });

    if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);

    // Retorna o objeto direto, sem formatação de string!
    return res.json();
  },

  // 7. Lista todos os versículos por versão, livro (abreviação) e número do capítulo
  getVersesByReference(
    versionId: number,
    bookName: string,
    chapterNumber: number
  ): Promise<BibleVerse[]> {
    return fetchAPI<BibleVerse[]>(
      `/api/Bible/versions/${versionId}/books/${bookName}/chapters/${chapterNumber}/verses`
    );
  },
};
