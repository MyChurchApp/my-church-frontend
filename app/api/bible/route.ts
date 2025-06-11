import { type NextRequest, NextResponse } from "next/server"

// Endpoint para listar todos os capítulos disponíveis
export async function GET(request: NextRequest) {
  try {
    const chapters = [
      { id: 1, book: "Gênesis", chapter: 1, verses: 3 },
      { id: 2, book: "João", chapter: 3, verses: 1 },
      { id: 3, book: "Salmos", chapter: 23, verses: 2 },
      { id: 4, book: "Filipenses", chapter: 4, verses: 1 },
      { id: 5, book: "Romanos", chapter: 8, verses: 1 },
    ]

    return NextResponse.json({
      success: true,
      chapters,
      total: chapters.length,
    })
  } catch (error) {
    console.error("Erro ao listar capítulos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
