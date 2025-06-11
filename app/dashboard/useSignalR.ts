"use client"

import { useEffect } from "react"
import * as signalR from "@microsoft/signalr"

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

        // Evento de leitura bíblica destacada - corrigindo a estrutura dos dados
        connection.on("BibleReadingHighlighted", (data) => {
          console.log("📖 Dados recebidos do SignalR:", data)

          // Tentar diferentes estruturas de dados possíveis
          let chapterId, verseId

          if (data && typeof data === "object") {
            // Caso 1: { ChapterId: 1, VerseId: 2 }
            chapterId = data.ChapterId || data.chapterId
            verseId = data.VerseId || data.verseId

            // Caso 2: { chapter: 1, verse: 2 }
            if (!chapterId) chapterId = data.chapter
            if (!verseId) verseId = data.verse

            // Caso 3: { id: 1, verse_id: 2 }
            if (!chapterId) chapterId = data.id || data.chapter_id
            if (!verseId) verseId = data.verse_id
          }

          // Valores padrão se ainda estiverem undefined
          chapterId = chapterId || 1
          verseId = verseId || 1

          console.log(`📖 Processando: Capítulo ${chapterId}, Versículo ${verseId}`)

          // Disparar evento customizado para a página capturar
          const event = new CustomEvent("bibleReadingHighlighted", {
            detail: { ChapterId: chapterId, VerseId: verseId },
          })
          window.dispatchEvent(event)

          // Mostrar alerta com dados corretos
          alert(`Leitura bíblica destacada: Capítulo ${chapterId}, Versículo ${verseId}`)
        })

        // Adicionar outros eventos possíveis
        connection.on("BibleReading", (data) => {
          console.log("📖 BibleReading recebido:", data)
          // Mesmo tratamento
          const chapterId = data?.ChapterId || data?.chapterId || data?.chapter || 1
          const verseId = data?.VerseId || data?.verseId || data?.verse || 1

          const event = new CustomEvent("bibleReadingHighlighted", {
            detail: { ChapterId: chapterId, VerseId: verseId },
          })
          window.dispatchEvent(event)
        })

        // Log de todos os eventos recebidos para debug
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
