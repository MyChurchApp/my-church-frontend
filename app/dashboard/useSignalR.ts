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

        connection.on("BibleReadingHighlighted", async ({ ChapterId, VerseId }) => {
          // Disparar evento customizado para a página capturar
          const event = new CustomEvent("bibleReadingHighlighted", {
            detail: { ChapterId, VerseId },
          })
          window.dispatchEvent(event)

          // Mostrar alerta como fallback
          try {
            alert(`Leitura bíblica destacada: Capítulo ${ChapterId}, Versículo ${VerseId}`)
          } catch (err) {
            console.error("❌ Erro ao processar leitura bíblica:", err)
          }
        })
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
