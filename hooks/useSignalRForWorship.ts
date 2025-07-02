import { useState, useEffect, useCallback, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

// A URL do seu hub SignalR. Geralmente é a URL da API + /worshipHub (verifique na sua API)
const HUB_URL = `${
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api"
}/worshipHub`;

interface SignalRMessage {
  type: string;
  payload: any;
}

export function useSignalRForWorship(worshipId: number | null) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [latestMessage, setLatestMessage] = useState<SignalRMessage | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);

  // Usamos useRef para manter a referência da conexão estável entre renderizações
  const connectionRef = useRef<HubConnection | null>(null);

  // Função para enviar mensagens para o grupo do culto no hub
  const broadcastMessage = useCallback(
    async (type: string, payload: any) => {
      if (
        connectionRef.current &&
        connectionRef.current.state === "Connected" &&
        worshipId
      ) {
        try {
          await connectionRef.current.invoke(
            "SendMessageToGroup",
            String(worshipId),
            type,
            payload
          );
          console.log(`Mensagem enviada [${type}]:`, payload);
        } catch (e) {
          console.error("Falha ao enviar mensagem via SignalR:", e);
        }
      } else {
        console.warn("SignalR não está conectado. Mensagem não enviada.");
      }
    },
    [worshipId]
  );

  useEffect(() => {
    // Inicia a conexão apenas se houver um worshipId
    if (worshipId && !connectionRef.current) {
      console.log(`Iniciando conexão com SignalR para o culto ${worshipId}...`);

      // 1. Cria o construtor da conexão
      const newConnection = new HubConnectionBuilder()
        .withUrl(HUB_URL)
        .withAutomaticReconnect() // Tenta reconectar automaticamente em caso de queda
        .configureLogging(LogLevel.Information)
        .build();

      // 2. Define a referência e o estado
      setConnection(newConnection);
      connectionRef.current = newConnection;

      // 3. Define o que fazer ao receber uma mensagem
      // O nome do método 'ReceiveMessage' deve ser exatamente o mesmo definido no seu Hub do backend
      newConnection.on("ReceiveMessage", (type: string, payload: any) => {
        console.log(`Mensagem recebida [${type}]:`, payload);
        setLatestMessage({ type, payload });
      });

      // 4. Inicia a conexão
      newConnection
        .start()
        .then(() => {
          setIsConnected(true);
          console.log("SignalR Conectado com sucesso!");

          // 5. Entra no grupo específico do culto
          // O nome do método 'JoinWorshipGroup' deve ser o mesmo do backend
          newConnection
            .invoke("JoinWorshipGroup", String(worshipId))
            .then(() => console.log(`Entrou no grupo do culto: ${worshipId}`))
            .catch((e) =>
              console.error("Falha ao entrar no grupo do culto:", e)
            );
        })
        .catch((e) => {
          console.error("Falha na conexão com SignalR:", e);
          setIsConnected(false);
        });

      // Define handlers para desconexão e reconexão para UI
      newConnection.onreconnecting(() => setIsConnected(false));
      newConnection.onreconnected(() => setIsConnected(true));
      newConnection.onclose(() => {
        setIsConnected(false);
        connectionRef.current = null;
      });
    }

    // Função de limpeza para desconectar quando o componente for desmontado
    return () => {
      if (
        connectionRef.current &&
        connectionRef.current.state === "Connected"
      ) {
        console.log(`Desconectando do SignalR do culto ${worshipId}...`);
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [worshipId]); // A dependência é apenas o ID do culto

  return { connection, isConnected, latestMessage, broadcastMessage };
}
