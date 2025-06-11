"use client";

import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";

export function useSignalR(worshipServiceId: number) {
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://demoapp.top1soft.com.br/ws/worship")
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await connection.start();
        await connection.invoke("JoinWorship", worshipServiceId);
        console.log("✅ Conectado ao SignalR");

        connection.on(
          "BibleReadingHighlighted",
          async ({ ChapterId, VerseId }) => {
            try {
              const res = await fetch(
                `/api/bible/chapters/${ChapterId}/verses/${VerseId}`
              );
              const data = await res.json();
              alert(`Leitura bíblica: ${data.text}`);
            } catch (err) {
              console.error("❌ Erro ao buscar leitura bíblica:", err);
            }
          }
        );
      } catch (err) {
        console.error("❌ Falha ao conectar SignalR:", err);
      }
    };

    startConnection();

    return () => {
      connection.stop();
    };
  }, [worshipServiceId]);
}
