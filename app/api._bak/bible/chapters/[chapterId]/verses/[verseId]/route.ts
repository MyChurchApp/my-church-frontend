import { type NextRequest, NextResponse } from "next/server"

// Mock data para demonstração - você pode substituir por uma API real ou banco de dados
const bibleData: Record<string, Record<string, any>> = {
  "1": {
    "1": {
      book: "Gênesis",
      chapter: 1,
      verse: 1,
      text: "No princípio criou Deus os céus e a terra.",
    },
    "2": {
      book: "Gênesis",
      chapter: 1,
      verse: 2,
      text: "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.",
    },
    "3": {
      book: "Gênesis",
      chapter: 1,
      verse: 3,
      text: "E disse Deus: Haja luz; e houve luz.",
    },
  },
  "2": {
    "1": {
      book: "João",
      chapter: 3,
      verse: 16,
      text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    },
  },
  "3": {
    "1": {
      book: "Salmos",
      chapter: 23,
      verse: 1,
      text: "O Senhor é o meu pastor, nada me faltará.",
    },
    "2": {
      book: "Salmos",
      chapter: 23,
      verse: 2,
      text: "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.",
    },
  },
  "4": {
    "1": {
      book: "Filipenses",
      chapter: 4,
      verse: 13,
      text: "Posso todas as coisas em Cristo que me fortalece.",
    },
  },
  "5": {
    "1": {
      book: "Romanos",
      chapter: 8,
      verse: 28,
      text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.",
    },
  },
}

export async function GET(request: NextRequest, { params }: { params: { chapterId: string; verseId: string } }) {
  try {
    const { chapterId, verseId } = params

    // Validar parâmetros
    if (!chapterId || !verseId) {
      return NextResponse.json({ error: "ChapterId e VerseId são obrigatórios" }, { status: 400 })
    }

    // Buscar versículo nos dados mock
    const chapter = bibleData[chapterId]
    if (!chapter) {
      return NextResponse.json(
        {
          error: "Capítulo não encontrado",
          book: "Desconhecido",
          chapter: Number.parseInt(chapterId),
          verse: Number.parseInt(verseId),
          text: "Versículo não encontrado na base de dados.",
        },
        { status: 404 },
      )
    }

    const verse = chapter[verseId]
    if (!verse) {
      return NextResponse.json(
        {
          error: "Versículo não encontrado",
          book: "Desconhecido",
          chapter: Number.parseInt(chapterId),
          verse: Number.parseInt(verseId),
          text: "Versículo não encontrado na base de dados.",
        },
        { status: 404 },
      )
    }

    // Retornar versículo encontrado
    return NextResponse.json({
      success: true,
      data: verse,
      ...verse,
    })
  } catch (error) {
    console.error("Erro ao buscar versículo:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        book: "Erro",
        chapter: 0,
        verse: 0,
        text: "Erro ao carregar o versículo. Tente novamente.",
      },
      { status: 500 },
    )
  }
}

// Endpoint para listar versículos de um capítulo
export async function POST(request: NextRequest, { params }: { params: { chapterId: string; verseId: string } }) {
  try {
    const { chapterId } = params
    const chapter = bibleData[chapterId]

    if (!chapter) {
      return NextResponse.json({ error: "Capítulo não encontrado" }, { status: 404 })
    }

    const verses = Object.values(chapter)
    return NextResponse.json({
      success: true,
      chapterId: Number.parseInt(chapterId),
      verses,
      total: verses.length,
    })
  } catch (error) {
    console.error("Erro ao listar versículos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
