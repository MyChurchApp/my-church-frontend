// Serviço para acessar a API bíblica
const API_URL = "https://demoapp.top1soft.com.br/api/Bible"

// Função auxiliar para fazer requisições autenticadas
async function fetchWithAuth(url: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

  if (!token) {
    throw new Error("Token de autenticação não encontrado")
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`, // Formato correto: Bearer + espaço + token
      Accept: "*/*",
    },
  })

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} ${response.statusText}`)
  }

  return response.json()
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

// API para versículos de um capítulo
export async function getVersesFromChapter(chapterId: number) {
  return fetchWithAuth(`${API_URL}/chapters/${chapterId}/verses`)
}

// API para um versículo específico
export async function getSpecificVerse(chapterId: number, verseNumber: number) {
  return fetchWithAuth(`${API_URL}/chapters/${chapterId}/verses/${verseNumber}`)
}
