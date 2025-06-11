// Serviço para acessar a API bíblica
const API_URL = "https://demoapp.top1soft.com.br/api/Bible"

// Função auxiliar para fazer requisições autenticadas
async function fetchWithAuth(url: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

  if (!token) {
    throw new Error("Token de autenticação não encontrado")
  }

  console.log("🌐 Fazendo requisição para:", url)
  console.log("🔑 Token:", token ? `${token.substring(0, 20)}...` : "Não encontrado")

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
    },
  })

  console.log("📡 Resposta da API:", response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("❌ Erro na API:", response.status, response.statusText, errorText)
    throw new Error(`Erro na API: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log("✅ Dados recebidos da API:", data)
  return data
}

// API para versões da Bíblia
export async function getBibleVersions() {
  return fetchWithAuth(`${API_URL}/versions`)
}

// API para livros de uma versão
export async function getBooksFromVersion(versionId: number) {
  return fetchWithAuth(`${API_URL}/versions/${versionId}/books`)
}

// API para capítulos de um livro
export async function getChaptersFromBook(bookId: number) {
  return fetchWithAuth(`${API_URL}/books/${bookId}/chapters`)
}

// API para versículos de um capítulo - CORRIGIDA
export async function getVersesFromChapter(chapterId: number) {
  return fetchWithAuth(`${API_URL}/chapters/${chapterId}/verses`)
}

// API para um versículo específico - NOVA IMPLEMENTAÇÃO
export async function getSpecificVerse(chapterId: number, verseNumber: number) {
  console.log("🔍 Buscando versículo específico...")
  console.log("   chapterId:", chapterId)
  console.log("   verseNumber:", verseNumber)

  // Primeiro, buscar todos os versículos do capítulo
  const verses = await getVersesFromChapter(chapterId)
  console.log("📚 Versículos do capítulo recebidos:", verses)

  // Depois, filtrar pelo número do versículo
  if (Array.isArray(verses)) {
    const specificVerse = verses.find(
      (verse) =>
        verse.verseNumber === verseNumber ||
        verse.verse === verseNumber ||
        verse.number === verseNumber ||
        verse.id === verseNumber,
    )

    if (specificVerse) {
      console.log("✅ Versículo específico encontrado:", specificVerse)
      return specificVerse
    } else {
      console.log("❌ Versículo não encontrado no array. Versículos disponíveis:")
      verses.forEach((v, index) => {
        console.log(`   [${index}]:`, v)
      })
      throw new Error(`Versículo ${verseNumber} não encontrado no capítulo ${chapterId}`)
    }
  } else {
    console.log("❌ Resposta da API não é um array:", verses)
    throw new Error("Formato de resposta inesperado da API")
  }
}

// Função auxiliar para buscar informações completas de uma leitura bíblica
export async function getBibleReading(versionId: number, bookId: number, chapterId: number, verseId?: number) {
  console.log("📖 Buscando leitura bíblica completa...")
  console.log("   versionId:", versionId)
  console.log("   bookId:", bookId)
  console.log("   chapterId:", chapterId)
  console.log("   verseId:", verseId)

  try {
    // 1. Buscar informações da versão (opcional - para obter nome da versão)
    let versionName = `Versão ${versionId}`
    try {
      const versions = await getBibleVersions()
      const version = versions.find((v: any) => v.id === versionId)
      if (version) {
        versionName = version.name || version.title || versionName
      }
    } catch (error) {
      console.warn("⚠️ Não foi possível obter nome da versão:", error)
    }

    // 2. Buscar informações do livro (opcional - para obter nome do livro)
    let bookName = `Livro ${bookId}`
    try {
      const books = await getBooksFromVersion(versionId)
      const book = books.find((b: any) => b.id === bookId)
      if (book) {
        bookName = book.name || book.title || bookName
      }
    } catch (error) {
      console.warn("⚠️ Não foi possível obter nome do livro:", error)
    }

    // 3. Buscar o conteúdo (versículo específico ou capítulo completo)
    let content
    const isFullChapter = !verseId

    if (verseId) {
      // Buscar versículo específico
      content = await getSpecificVerse(chapterId, verseId)
    } else {
      // Buscar capítulo completo
      content = await getVersesFromChapter(chapterId)
    }

    return {
      versionId,
      versionName,
      bookId,
      bookName,
      chapterId,
      verseId,
      isFullChapter,
      content,
      success: true,
    }
  } catch (error) {
    console.error("❌ Erro ao buscar leitura bíblica:", error)
    return {
      versionId,
      versionName: `Versão ${versionId}`,
      bookId,
      bookName: `Livro ${bookId}`,
      chapterId,
      verseId,
      isFullChapter: !verseId,
      content: null,
      error: (error as Error).message,
      success: false,
    }
  }
}
