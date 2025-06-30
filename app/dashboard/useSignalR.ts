"use client";

import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { getBibleReading } from "@/lib/bible-api";

const API_URL = "https://demoapp.top1soft.com.br";
const HUB_PATH = "/ws/worship";

export function useSignalR(worshipServiceId: number) {
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      console.warn("⚠️ Nenhum token JWT encontrado no localStorage.");
      return;
    }

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
        await connection.invoke("JoinWorship", worshipServiceId);

        connection.on("BibleReadingHighlighted", async (data) => {
          let versionId, bookId, chapterId, verseId;

          if (data && typeof data === "object") {
            versionId =
              data.versionId ||
              data.VersionId ||
              data.version_id ||
              data.versions;
            bookId = data.bookId || data.BookId || data.book_id || data.book;
            chapterId = data.chapterId || data.ChapterId || data.chapter_id;
            verseId = data.verseId || data.VerseId || data.verse_id;

            if (!versionId) {
              versionId = data.version || 1;
            }
            if (!bookId) {
              bookId = data.id || 1;
            }
            if (!chapterId) {
              chapterId = data.chapter || 1;
            }
            if (!verseId) {
              verseId = data.verse;
            }
          }

          // Valores padrão
          versionId = versionId || 1;
          bookId = bookId || 1;
          chapterId = chapterId || 1;
          // verseId pode ser undefined para capítulo completo

          const logMessage = verseId
            ? `📖 Processando: Versão ${versionId}, Livro ${bookId}, Capítulo ${chapterId}, Versículo ${verseId}`
            : `📖 Processando: Versão ${versionId}, Livro ${bookId}, Capítulo ${chapterId} (capítulo completo)`;

          try {
            // Usar a nova função que faz as chamadas corretas
            const bibleData = await getBibleReading(
              versionId,
              bookId,
              chapterId,
              verseId
            );

            if (bibleData.success) {
              // Disparar evento customizado com os dados da API
              const eventDetail = {
                versionId,
                bookId,
                chapterId,
                verseId,
                isFullChapter: !verseId,
                apiData: bibleData,
                originalData: data,
              };

              const event = new CustomEvent("bibleReadingHighlighted", {
                detail: eventDetail,
              });
              window.dispatchEvent(event);
            } else {
              throw new Error(bibleData.error || "Erro desconhecido na API");
            }
          } catch (error) {
            console.error("❌ Erro ao buscar dados bíblicos:", error);
            console.error("❌ Stack trace:", (error as Error).stack);

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
            };

            const event = new CustomEvent("bibleReadingHighlighted", {
              detail: errorEventDetail,
            });
            window.dispatchEvent(event);
          }
        });

        // Log de reconexão
        connection.onreconnecting((error) => {
          console.warn("🔄 SignalR reconectando...", error);
        });

        connection.onreconnected((connectionId) => {});

        connection.onclose((error) => {
          console.error("❌ Conexão SignalR fechada:", error);
        });
      } catch (err) {
        console.error("❌ Falha ao conectar SignalR:", err);
        console.error("❌ Stack trace:", (err as Error).stack);
      }
    };

    startConnection();

    return () => {
      connection.stop();
    };
  }, [worshipServiceId]);
}
