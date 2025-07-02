"use client";

import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getToken } from "@/lib/auth-utils"; // Ajuste o caminho se necessário
import { getBibleReading } from "@/lib/bible-api"; // Importando a função para buscar dados da Bíblia

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "https://demoapp.top1soft.com.br";
const HUB_PATH = "/ws/worship";

export function useSignalRForWorship(worshipId: number | null) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Se não houver ID do culto, não faz nada e garante que a conexão esteja marcada como "desconectada".
    if (!worshipId) {
      setIsConnected(false);
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn("⚠️ Nenhum token JWT encontrado para a conexão SignalR.");
      return;
    }

    // Constrói a conexão com a URL base e o token.
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

        await connection.invoke("JoinWorship", worshipId);
        console.log(`✅ [SignalR] Entrou no grupo do culto: ${worshipId}`);

        // --- OUVINTE PARA LEITURA DA BÍBLIA (LÓGICA RESTAURADA) ---
        connection.on("BibleReadingHighlighted", async (data) => {
          console.log(
            "[SignalR] Evento 'BibleReadingHighlighted' recebido:",
            data
          );

          // Extrai os IDs do objeto recebido, com valores padrão
          const { versionId = 1, bookId = 1, chapterId = 1, verseId } = data;

          try {
            // Chama a API para buscar os dados completos da leitura
            const bibleData = await getBibleReading(
              versionId,
              bookId,
              chapterId,
              verseId
            );

            // Prepara o payload do evento com os dados da API
            const eventDetail = {
              ...data, // Mantém os dados originais do evento
              apiData: bibleData.success ? bibleData : null,
              error: !bibleData.success,
              errorMessage: bibleData.error,
            };

            // Dispara o evento para a página ouvir
            window.dispatchEvent(
              new CustomEvent("bibleReadingUpdated", { detail: eventDetail })
            );
          } catch (error) {
            console.error(
              "❌ Erro ao processar evento BibleReadingHighlighted:",
              error
            );
            // Dispara um evento de erro se a chamada à API falhar
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

        // --- OUVINTE PARA HINOS ---
        // Apenas repassa o evento que vem do servidor.
        connection.on("HymnPresented", (data) => {
          console.log("[SignalR] Evento 'HymnPresented' recebido:", data);
          window.dispatchEvent(
            new CustomEvent("HymnPresented", { detail: data })
          );
        });
      } catch (err) {
        console.error("❌ [SignalR] Falha ao iniciar conexão:", err);
        setIsConnected(false);
        setTimeout(startConnection, 5000); // Tenta reconectar em 5s
      }
    };

    startConnection();

    connection.onclose(() => {
      console.log("[SignalR] Conexão fechada.");
      setIsConnected(false);
    });

    // Função de limpeza para parar a conexão
    return () => {
      console.log("[SignalR] Parando conexão.");
      connection.off("BibleReadingHighlighted");
      connection.off("HymnPresented");
      connection.stop();
    };
  }, [worshipId]);

  return { isConnected };
}
