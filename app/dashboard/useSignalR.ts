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

    console.log("🔌 Iniciando conexão SignalR...")
    console.log("📍 URL:", `${API_URL}${HUB_PATH}`)
    console.log("🔑 Token:", token ? `${token.substring(0, 20)}...` : "Não encontrado")

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}${HUB_PATH}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    const startConnection = async () => {
      try {
        console.log("🚀 Tentando conectar ao SignalR...")
        await connection.start()
        console.log("✅ Conectado ao SignalR com sucesso!")

        console.log("🎯 Entrando no worship service:", worshipServiceId)
        await connection.invoke("JoinWorship", worshipServiceId)
        console.log("✅ Entrou no worship service com sucesso!")

        // Evento de leitura bíblica destacada
        connection.on("BibleReadingHighlighted", async (data) => {
          console.log("🎉 ===== EVENTO BIBLE READING HIGHLIGHTED RECEBIDO =====")
          console.log("📖 Dados brutos recebidos:", data)
          console.log("📖 Tipo dos dados:", typeof data)
          console.log("📖 É array?", Array.isArray(data))
          console.log("📖 Keys do objeto:", data ? Object.keys(data) : "Não é objeto")
          console.log("📖 JSON stringified:", JSON.stringify(data, null, 2))

          // Extrair dados com diferentes estruturas possíveis
          let versionId, bookId, chapterId, verseId

          if (data && typeof data === "object") {
            console.log("🔍 Analisando estrutura dos dados...")

            // Estrutura completa esperada: { versionId: 1, bookId: 1, chapterId: 1, verseId?: 1 }
            versionId = data.versionId || data.VersionId || data.version_id || data.versions
            bookId = data.bookId || data.BookId || data.book_id || data.book
            chapterId = data.chapterId || data.ChapterId || data.chapter_id
            verseId = data.verseId || data.VerseId || data.verse_id

            console.log("🔍 Primeira tentativa de extração:")
            console.log("   versionId:", versionId)
            console.log("   bookId:", bookId)
            console.log("   chapterId:", chapterId)
            console.log("   verseId:", verseId)

            // Fallbacks para estruturas antigas
            if (!versionId) {
              versionId = data.version || 1
              console.log("🔄 Fallback versionId:", versionId)
            }
            if (!bookId) {
              bookId = data.id || 1
              console.log("🔄 Fallback bookId:", bookId)
            }
            if (!chapterId) {
              chapterId = data.chapter || 1
              console.log("🔄 Fallback chapterId:", chapterId)
            }
            if (!verseId) {
              verseId = data.verse
              console.log("🔄 Fallback verseId:", verseId)
            }
          }

          // Valores padrão
          versionId = versionId || 1
          bookId = bookId || 1
          chapterId = chapterId || 1
          // verseId pode ser undefined para capítulo completo

          console.log("📊 Valores finais extraídos:")
          console.log("   versionId:", versionId)
          console.log("   bookId:", bookId)
          console.log("   chapterId:", chapterId)
          console.log("   verseId:", verseId)
          console.log("   isFullChapter:", !verseId)

          const logMessage = verseId
            ? `📖 Processando: Versão ${versionId}, Livro ${bookId}, Capítulo ${chapterId}, Versículo ${verseId}`
            : `📖 Processando: Versão ${versionId}, Livro ${bookId}, Capítulo ${chapterId} (capítulo completo)`

          console.log(logMessage)

          try {
            console.log("🌐 Iniciando busca na API bíblica...")

            // Buscar dados da API bíblica
            let bibleData

            if (verseId) {
              console.log(`🔍 Buscando versículo específico: capítulo ${chapterId}, versículo ${verseId}`)
              console.log(`🌐 URL que será chamada: /api/Bible/chapters/${chapterId}/verses/${verseId}`)
              bibleData = await getSpecificVerse(chapterId, verseId)
              console.log("📖 Dados do versículo recebidos:", bibleData)
            } else {
              console.log(`🔍 Buscando capítulo completo: ${chapterId}`)
              console.log(`🌐 URL que será chamada: /api/Bible/chapters/${chapterId}/verses`)
              bibleData = await getVersesFromChapter(chapterId)
              console.log("📖 Dados do capítulo recebidos:", bibleData)
            }

            console.log("✅ Dados da API bíblica obtidos com sucesso!")

            // Disparar evento customizado com os dados da API
            const eventDetail = {
              versionId,
              bookId,
              chapterId,
              verseId,
              isFullChapter: !verseId,
              apiData: bibleData,
              originalData: data, // Manter dados originais para debug
            }

            console.log("🎯 Disparando evento customizado com dados:", eventDetail)

            const event = new CustomEvent("bibleReadingHighlighted", {
              detail: eventDetail,
            })
            window.dispatchEvent(event)

            console.log("✅ Evento customizado disparado com sucesso!")
          } catch (error) {
            console.error("❌ Erro ao buscar dados bíblicos:", error)
            console.error("❌ Stack trace:", (error as Error).stack)

            // Disparar evento mesmo com erro
            const errorEventDetail = {
              versionId,
              bookId,
              chapterId,
              verseId,
              isFullChapter: !verseId,
              error: true,
              errorMessage: (error as Error).message,
              originalData: data,
            }

            console.log("🎯 Disparando evento de erro com dados:", errorEventDetail)

            const event = new CustomEvent("bibleReadingHighlighted", {
              detail: errorEventDetail,
            })
            window.dispatchEvent(event)

            console.log("✅ Evento de erro disparado!")
          }

          console.log("🎉 ===== FIM DO PROCESSAMENTO DO EVENTO =====")
        })

        // Log de todos os eventos para debug
        connection.onreceive = (data) => {
          console.log("🔄 ===== EVENTO SIGNALR GENÉRICO RECEBIDO =====")
          console.log("📦 Dados:", data)
          console.log("📦 Tipo:", typeof data)
          console.log("📦 JSON:", JSON.stringify(data, null, 2))
          console.log("🔄 ===== FIM DO EVENTO GENÉRICO =====")
        }

        // Log de reconexão
        connection.onreconnecting((error) => {
          console.warn("🔄 SignalR reconectando...", error)
        })

        connection.onreconnected((connectionId) => {
          console.log("✅ SignalR reconectado! ID:", connectionId)
        })

        connection.onclose((error) => {
          console.error("❌ Conexão SignalR fechada:", error)
        })
      } catch (err) {
        console.error("❌ Falha ao conectar SignalR:", err)
        console.error("❌ Stack trace:", (err as Error).stack)
      }
    }

    startConnection()

    return () => {
      console.log("🔌 Fechando conexão SignalR...")
      connection.stop()
      console.log("✅ Conexão SignalR fechada!")
    }
  }, [worshipServiceId])
}
