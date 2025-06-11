"use client"

import { useEffect } from "react"
import * as signalR from "@microsoft/signalr"
import { getSpecificVerse, getVersesFromChapter } from "@/lib/bible-api"

const API_URL = "https://demoapp.top1soft.com.br"
const HUB_PATH = "/ws/worship"

export function useSignalR(worshipServiceId: number) {
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    if (!token) {
      console.warn("⚠️ Nenhum token JWT encontrado no localStorage.")
      return
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}${HUB_PATH}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    const startConnection = async () => {
      try {
        await connection.start()
        await connection.invoke("JoinWorship", worshipServiceId)
        console.log("✅ Conectado ao SignalR")

        // Evento de leitura bíblica destacada
        connection.on("BibleReadingHighlighted", async (data) => {
          console.log("📖 Dados recebidos do SignalR:", data)

          // Extrair dados com diferentes estruturas possíveis
          let versionId, bookId, chapterId, verseId

          if (data && typeof data === "object") {
            // Estrutura completa esperada: { versionId: 1, bookId: 1, chapterId: 1, verseId?: 1 }
            versionId = data.versionId || data.VersionId || data.version_id || data.versions
            bookId = data.bookId || data.BookId || data.book_id || data.book
            chapterId = data.chapterId || data.ChapterId || data.chapter_id
            verseId = data.verseId || data.VerseId || data.verse_id

            // Fallbacks para estruturas antigas
            if (!versionId) versionId = data.version || 1
            if (!bookId) bookId = data.id || 1
            if (!chapterId) chapterId = data.chapter || 1
            if (!verseId) verseId = data.verse
          }

          // Valores padrão
          versionId = versionId || 1
          bookId = bookId || 1
          chapterId = chapterId || 1
          // verseId pode ser undefined para capítulo completo

          console.log(
            `📖 Processando: Versão ${versionId}, Livro ${bookId}, Capítulo ${chapterId}${verseId ? `, Versículo ${verseId}` : " (capítulo completo)"}`,
          )

          try {
            // Buscar dados da API bíblica
            let bibleData

            if (verseId) {
              // Buscar versículo específico
              bibleData = await getSpecificVerse(chapterId, verseId)
            } else {
              // Buscar capítulo completo
              bibleData = await getVersesFromChapter(chapterId)
            }

            // Disparar evento customizado com os dados da API
            const event = new CustomEvent("bibleReadingHighlighted", {
              detail: {
                versionId,
                bookId,
                chapterId,
                verseId,
                isFullChapter: !verseId,
                apiData: bibleData,
                originalData: data, // Manter dados originais para debug
              },
            })
            window.dispatchEvent(event)
          } catch (error) {
            console.error("❌ Erro ao buscar dados bíblicos:", error)

            // Disparar evento mesmo com erro
            const event = new CustomEvent("bibleReadingHighlighted", {
              detail: {
                versionId,
                bookId,
                chapterId,
                verseId,
                isFullChapter: !verseId,
                error: true,
                errorMessage: (error as Error).message,
                originalData: data,
              },
            })
            window.dispatchEvent(event)
          }
        })

        // Log de todos os eventos para debug
        connection.onreceive = (data) => {
          console.log("🔄 Evento SignalR recebido:", data)
        }
      } catch (err) {
        console.error("❌ Falha ao conectar SignalR:", err)
      }
    }

    startConnection()

    return () => {
      connection.stop()
    }
  }, [worshipServiceId])
}
