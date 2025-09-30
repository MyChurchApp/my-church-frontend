import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get("bookId")
    const chapterId = searchParams.get("chapterId")
    const verseId = searchParams.get("verseId") // Opcional

    if (!bookId || !chapterId) {
      return NextResponse.json({ error: "bookId e chapterId são obrigatórios" }, { status: 400 })
    }

    const isFullChapter = !verseId

    // Mock data baseado nos parâmetros
    const mockBooks = {
      "1": "Gênesis",
      "2": "João",
      "3": "Salmos",
      "4": "Filipenses",
      "5": "Romanos",
    }

    const bookName = mockBooks[bookId as keyof typeof mockBooks] || `Livro ${bookId}`

    let response
    if (isFullChapter) {
      // Retornar capítulo completo
      response = {
        success: true,
        type: "chapter",
        bookId: Number.parseInt(bookId),
        chapterId: Number.parseInt(chapterId),
        book: bookName,
        chapter: Number.parseInt(chapterId),
        text: `Texto completo do capítulo ${chapterId} do livro ${bookName}. Este é um exemplo de capítulo completo que seria retornado pela API.`,
        isFullChapter: true,
      }
    } else {
      // Retornar versículo específico
      response = {
        success: true,
        type: "verse",
        bookId: Number.parseInt(bookId),
        chapterId: Number.parseInt(chapterId),
        verseId: Number.parseInt(verseId),
        book: bookName,
        chapter: Number.parseInt(chapterId),
        verse: Number.parseInt(verseId),
        text: `Texto do versículo ${chapterId}:${verseId} do livro ${bookName}.`,
        isFullChapter: false,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro na API de highlight:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
