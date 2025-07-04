"use client";

import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getToken } from "@/lib/auth-utils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "https://demoapp.top1soft.com.br";
const HUB_PATH = "/ws/worship";

export function useSignalRForWorship(worshipId: number | null) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!worshipId) {
      setIsConnected(false);
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn("⚠️ Nenhum token JWT encontrado para a conexão SignalR.");
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
        console.log("✅ [SignalR] Conexão estabelecida!");
        setIsConnected(true);

        await connection.invoke("JoinWorship", worshipId);
        console.log(`✅ [SignalR] Entrou no grupo do culto: ${worshipId}`);

        // --- OUVINTE PARA LEITURA DA BÍBLIA ---
        connection.on("BibleReadingHighlighted", (data) => {
          console.log(data);
          window.dispatchEvent(
            new CustomEvent("bibleReadingUpdated", { detail: data })
          );
        });

        // --- OUVINTE PARA HINOS ---
        connection.on("HymnPresented", (data) => {
          window.dispatchEvent(
            new CustomEvent("HymnPresented", { detail: data })
          );
        });

        // --- OUVINTES PARA OFERTA ---
        connection.on("OfferingPresented", (data) => {
          window.dispatchEvent(
            new CustomEvent("OfferingPresented", { detail: data })
          );
        });

        connection.on("OfferingFinished", (data) => {
          window.dispatchEvent(
            new CustomEvent("OfferingFinished", { detail: data })
          );
        });

        // --- OUVINTE PARA PEDIDOS DE ORAÇÃO ---
        connection.on("PrayerRequestReceived", (data) => {
          window.dispatchEvent(
            new CustomEvent("prayerRequestReceived", { detail: data })
          );
        });

        // --- ✅ NOVO OUVINTE PARA AVISOS ADMINISTRATIVOS ---
        // (O nome "AdminNoticeReceived" é uma suposição, ajuste se for diferente no seu backend)
        connection.on("AdminNoticeReceived", (data) => {
          console.log(
            "✅ [SignalR] Evento recebido: AdminNoticeReceived",
            data
          );
          window.dispatchEvent(
            new CustomEvent("adminNoticeReceived", { detail: data })
          );
        });
      } catch (err) {
        console.error("❌ [SignalR] Falha ao iniciar conexão:", err);
        setIsConnected(false);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    connection.onclose(() => {
      console.log("[SignalR] Conexão fechada.");
      setIsConnected(false);
    });

    return () => {
      console.log("[SignalR] Parando conexão.");
      connection.off("BibleReadingHighlighted");
      connection.off("HymnPresented");
      connection.off("OfferingPresented");
      connection.off("OfferingFinished");
      connection.off("PrayerRequestReceived");
      // ✅ Limpeza do novo ouvinte
      connection.off("AdminNoticeReceived");
      connection.stop();
    };
  }, [worshipId]);

  return { isConnected };
}
