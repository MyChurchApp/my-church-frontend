// Serviço para acessar a API bíblica
const API_URL = "https://demoapp.top1soft.com.br/api/Bible";

// Função auxiliar para fazer requisições autenticadas
async function fetchWithAuth(url: string) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "❌ Erro na API:",
      response.status,
      response.statusText,
      errorText
    );
    throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data;
}

// API para versões da Bíblia
export async function getBibleVersions() {
  return fetchWithAuth(`${API_URL}/versions`);
}

// API para livros de uma versão
export async function getBooksFromVersion(versionId: number) {
  return fetchWithAuth(`${API_URL}/versions/${versionId}/books`);
}

// API para capítulos de um livro - NOVA API INTEGRADA
export async function getChaptersFromBook(bookId: number) {
  return fetchWithAuth(`${API_URL}/books/${bookId}/chapters`);
}

// API para versículos de um capítulo
export async function getVersesFromChapter(chapterId: number) {
  return fetchWithAuth(`${API_URL}/chapters/${chapterId}/verses`);
}

// API para um versículo específico usando chapterId e verseNumber
export async function getSpecificVerseByNumber(
  chapterId: number,
  verseNumber: number
) {
  return fetchWithAuth(
    `${API_URL}/chapters/${chapterId}/verses/${verseNumber}`
  );
}

// API para um versículo específico - busca pelo ID no array
export async function getSpecificVerse(chapterId: number, verseId: number) {
  // Primeiro, buscar todos os versículos do capítulo
  const verses = await getVersesFromChapter(chapterId);

  // Depois, filtrar pelo ID do versículo
  if (Array.isArray(verses)) {
    const specificVerse = verses.find((verse) => verse.id === verseId);

    if (specificVerse) {
      return specificVerse;
    } else {
      verses.forEach((v, index) => {});
      throw new Error(
        `Versículo com ID ${verseId} não encontrado no capítulo ${chapterId}`
      );
    }
  } else {
    throw new Error("Formato de resposta inesperado da API");
  }
}

// Função auxiliar para buscar informações completas de uma leitura bíblica
export async function getBibleReading(
  versionId: number,
  bookId: number,
  chapterId: number,
  verseId?: number
) {
  try {
    // 1. Buscar informações da versão
    let versionName = `Versão ${versionId}`;
    try {
      const versions = await getBibleVersions();
      const version = versions.find((v: any) => v.id === versionId);
      if (version) {
        versionName =
          version.name || version.title || version.abbreviation || versionName;
      }
    } catch (error) {
      console.warn("⚠️ Não foi possível obter nome da versão:", error);
    }

    // 2. Buscar informações do livro
    let bookName = `Livro ${bookId}`;
    try {
      const books = await getBooksFromVersion(versionId);
      const book = books.find((b: any) => b.id === bookId);
      if (book) {
        bookName = book.name || book.title || book.abbreviation || bookName;
      }
    } catch (error) {
      console.warn("⚠️ Não foi possível obter nome do livro:", error);
    }

    // 3. Buscar informações do capítulo - USANDO NOVA API
    let chapterInfo = null;
    let chapterNumber = null;
    try {
      const chapters = await getChaptersFromBook(bookId);
      chapterInfo = chapters.find((c: any) => c.id === chapterId);
      if (chapterInfo) {
        chapterNumber = chapterInfo.number || chapterInfo.chapterNumber || null;
      }
    } catch (error) {
      console.warn("⚠️ Não foi possível obter informações do capítulo:", error);
    }

    // 4. Buscar o conteúdo (versículo específico ou capítulo completo)
    let content;
    const isFullChapter = !verseId;

    if (verseId) {
      // Buscar versículo específico
      content = await getSpecificVerse(chapterId, verseId);
    } else {
      // Buscar capítulo completo
      content = await getVersesFromChapter(chapterId);
    }

    return {
      versionId,
      versionName,
      bookId,
      bookName,
      chapterId,
      chapterNumber, // Número real do capítulo
      chapterInfo, // Informações completas do capítulo
      verseId,
      isFullChapter,
      content,
      success: true,
    };
  } catch (error) {
    console.error("❌ Erro ao buscar leitura bíblica:", error);
    return {
      versionId,
      versionName: `Versão ${versionId}`,
      bookId,
      bookName: `Livro ${bookId}`,
      chapterId,
      chapterNumber: null,
      chapterInfo: null,
      verseId,
      isFullChapter: !verseId,
      content: null,
      error: (error as Error).message,
      success: false,
    };
  }
}

// Função para buscar versículo por número (alternativa)
export async function getBibleReadingByVerseNumber(
  versionId: number,
  bookId: number,
  chapterId: number,
  verseNumber: number
) {
  try {
    // Usar a API direta para buscar por número do versículo
    const verse = await getSpecificVerseByNumber(chapterId, verseNumber);

    // Buscar informações adicionais (versão, livro, capítulo)
    const additionalInfo = await getBibleReading(versionId, bookId, chapterId);

    return {
      ...additionalInfo,
      content: verse,
      verseNumber,
      isFullChapter: false,
      success: true,
    };
  } catch (error) {
    console.error("❌ Erro ao buscar versículo por número:", error);
    // Fallback para o método original
    return getBibleReading(versionId, bookId, chapterId);
  }
}
