import { useState, useEffect, useRef } from "react";

// Constrói a URL do WebSocket a partir da URL da API
const getWebSocketURL = (worshipId: number): string => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br";
  // Substitui http por ws ou https por wss
  const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
  // Remove o protocolo http/https da URL da API e o /api do final, se houver
  const cleanUrl = apiUrl.replace(/^https?:\/\//, "").replace(/\/api$/, "");
  return `${wsProtocol}://${cleanUrl}/ws/worship/${worshipId}`;
};

interface WebSocketMessage {
  type: string;
  payload: any;
}

export function useWebSocketForWorship(worshipId: number | null) {
  const [latestMessage, setLatestMessage] = useState<WebSocketMessage | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!worshipId) return;

    const wsUrl = getWebSocketURL(worshipId);
    const ws = new WebSocket(wsUrl);
    websocketRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket conectado em: ${wsUrl}`);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WebSocket mensagem recebida:", message);
        setLatestMessage(message);
      } catch (e) {
        console.error("Erro ao processar mensagem do WebSocket:", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket desconectado.");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
      setIsConnected(false);
    };

    // Função de limpeza para fechar a conexão
    return () => {
      ws.close();
    };
  }, [worshipId]);

  return { latestMessage, isConnected };
}
