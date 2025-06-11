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

        // Evento de leitura bíblica destacada
        connection.on("BibleReadingHighlighted", ({ ChapterId, VerseId }) => {
          // Disparar evento customizado para a página de leitura bíblica
          const event = new CustomEvent("bibleReadingHighlighted", {
            detail: { ChapterId, VerseId },
          })
          window.dispatchEvent(event)

          // Buscar o texto da API REST
          fetch(`/api/bible/chapters/${ChapterId}/verses/${VerseId}`)
            .then((res) => res.json())
            .then((data) => {
              // Exibir alerta como backup
              alert(`Leitura bíblica: ${data.text}`)
            })
            .catch((err) => {
              console.error("Erro ao buscar leitura bíblica:", err)
            })
        })
      } catch (err) {
        console.error("Erro ao conectar SignalR:", err)
      }
    }

    startConnection()

    return () => {
      connection.stop()
    }
  }, [worshipServiceId])
}
