"use client";

import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getToken } from "@/lib/auth-utils";
import { getBibleReading } from "@/lib/bible-api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "https://demoapp.top1soft.com.br";
const HUB_PATH = "/ws/worship";

export function useSignalRForWorship(worshipId: number | null) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!worshipId) return;

    const token = getToken();
    if (!token) {
      console.warn("⚠️ Nenhum token JWT encontrado para a conexão SignalR.");
      return;
    }

    // A URL deve ser apenas a base, sem o ID, como no seu exemplo
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}${HUB_PATH}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("✅ [SignalR] Conexão estabelecida!");
        setIsConnected(true);

        // Usa "JoinWorship" e passa o ID do culto, como no seu exemplo
        await connection.invoke("JoinWorship", worshipId);
        console.log(`✅ [SignalR] Entrou no grupo do culto: ${worshipId}`);

        connection.on("BibleReadingHighlighted", async (data) => {
          console.log(
            "[SignalR] Evento BibleReadingHighlighted recebido:",
            data
          );

          const { versionId = 1, bookId = 1, chapterId = 1, verseId } = data;

          try {
            const bibleData = await getBibleReading(
              versionId,
              bookId,
              chapterId,
              verseId
            );

            const eventDetail = {
              ...data,
              apiData: bibleData.success ? bibleData : null,
              error: !bibleData.success,
              errorMessage: bibleData.error,
            };

            // Dispara um evento customizado para a página ouvir
            window.dispatchEvent(
              new CustomEvent("bibleReadingUpdated", { detail: eventDetail })
            );
          } catch (error) {
            console.error(
              "❌ Erro ao processar evento BibleReadingHighlighted:",
              error
            );
            window.dispatchEvent(
              new CustomEvent("bibleReadingUpdated", {
                detail: {
                  ...data,
                  error: true,
                  errorMessage: (error as Error).message,
                },
              })
            );
          }
        });
      } catch (err) {
        console.error("❌ Falha ao conectar ou entrar no grupo:", err);
        setIsConnected(false);
      }
    };

    startConnection();

    connection.onclose(() => setIsConnected(false));

    return () => {
      connection.stop();
    };
  }, [worshipId]);

  return { isConnected };
}
