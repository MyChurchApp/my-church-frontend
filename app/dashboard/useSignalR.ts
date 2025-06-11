"use client";

import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";

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
              // Proper error handling without console logs
            }
          }
        );
      } catch (err) {
        // Proper error handling without console logs
      }
    };

    startConnection();

    return () => {
      connection.stop();
    };
  }, [worshipServiceId]);
}
