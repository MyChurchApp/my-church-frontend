"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen, WifiOff, AlertTriangle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Importando os services necessários
import { worshipService } from "@/services/worship/worship";
import { bibleService, type BibleVerse } from "@/services/biblia/biblia";

import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";
import { AnimatePresence, motion } from "framer-motion";

// --- Estilos CSS embutidos para o destaque ---
const styles = `
  .highlighted-verse {
    background-color: rgba(250, 204, 21, 0.2); /* Amarelo bem suave */
    color: #1f2937; /* Cor de texto um pouco mais escura */
    padding: 12px 8px;
    margin: 4px -8px;
    border-radius: 8px;
    border-left: 4px solid #facc15; /* Borda amarela mais forte */
    transform: scale(1.01);
    transition: all 0.4s ease-in-out;
  }
`;

// --- Estrutura de dados para a leitura ao vivo ---
interface LiveReadingState {
  bookName: string;
  chapterNumber: number;
  highlightedVerseId: number;
  chapterVerses: BibleVerse[];
}

// --- Componente de Exibição Principal ---
const LiveReadingDisplay = ({
  readingState,
}: {
  readingState: LiveReadingState;
}) => {
  const highlightedVerseRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Rola suavemente para o versículo destacado quando ele muda
    highlightedVerseRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [readingState.highlightedVerseId]);

  const { bookName, chapterNumber, highlightedVerseId, chapterVerses } =
    readingState;

  return (
    <motion.div
      key={chapterNumber}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl h-[70vh] flex flex-col p-6 md:p-8 bg-white rounded-2xl shadow-2xl border"
    >
      <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center text-gray-800 sticky top-0 bg-white pb-4 z-10">
        {bookName} {chapterNumber}
      </h1>
      <div className="overflow-y-auto pr-4 space-y-4">
        {chapterVerses.map((verse) => {
          const isHighlighted = verse.id === highlightedVerseId;
          return (
            <p
              key={verse.id}
              ref={isHighlighted ? highlightedVerseRef : null}
              className={`text-lg md:text-xl text-left leading-relaxed text-gray-700 ${
                isHighlighted ? "highlighted-verse font-semibold" : ""
              }`}
            >
              <sup className="font-bold text-blue-600 mr-2">
                {verse.verseNumber}
              </sup>
              {verse.text}
            </p>
          );
        })}
      </div>
    </motion.div>
  );
};

// --- Componentes de Estado da Página (Aguardando, Erro, etc.) ---
const WaitingDisplay = () => (
  <div className="w-full max-w-4xl p-8 bg-white rounded-2xl shadow-lg min-h-[400px] flex items-center justify-center">
    <div className="text-center text-gray-500">
      <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h2 className="text-2xl font-semibold">Aguardando transmissão...</h2>
      <p className="mt-2 text-gray-400">
        A leitura da Bíblia aparecerá aqui em tempo real.
      </p>
    </div>
  </div>
);

const LoadingDisplay = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
    <h2 className="mt-4 text-2xl text-gray-700">{text}</h2>
  </div>
);

// --- Lógica Principal da Página ---
function AcompanharCultoContent() {
  const searchParams = useSearchParams();
  const worshipIdFromUrl = searchParams.get("worshipId");
  const [activeWorshipId, setActiveWorshipId] = useState<number | null>(
    worshipIdFromUrl ? Number(worshipIdFromUrl) : null
  );

  const [liveReading, setLiveReading] = useState<LiveReadingState | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: activeWorship, isLoading: isLoadingWorship } = useQuery({
    queryKey: ["active-worship-service"],
    queryFn: () => worshipService.findActiveWorshipService(),
    enabled: !worshipIdFromUrl,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const idFromUrl = worshipIdFromUrl ? Number(worshipIdFromUrl) : null;
    // Garante que o ID ativo seja null ou um número
    setActiveWorshipId(idFromUrl ?? activeWorship?.id ?? null);
  }, [activeWorship, worshipIdFromUrl]);

  const { isConnected } = useSignalRForWorship(activeWorshipId);

  useEffect(() => {
    // Definimos a função de callback com o tipo correto
    const handleReadingUpdate = async (event: Event) => {
      // Fazemos a verificação de tipo para acessar 'detail' com segurança
      if (!(event instanceof CustomEvent)) return;

      const readingData = event.detail;
      console.log("Evento recebido:", readingData);

      if (readingData.error || !readingData.apiData) {
        setError(readingData.errorMessage || "Ocorreu um erro na transmissão.");
        return;
      }
      setError(null);

      const { chapterId, verseId, bookName, chapterNumber } =
        readingData.apiData;

      if (
        liveReading?.chapterNumber === chapterNumber &&
        liveReading?.bookName === bookName
      ) {
        setLiveReading((prev) =>
          prev ? { ...prev, highlightedVerseId: verseId } : null
        );
        return;
      }

      try {
        setIsLoadingChapter(true);
        const chapterVerses = await bibleService.getVersesByChapterId(
          chapterId
        );
        setLiveReading({
          bookName,
          chapterNumber,
          highlightedVerseId: verseId,
          chapterVerses,
        });
      } catch (err) {
        console.error("Erro ao buscar capítulo:", err);
        setError("Não foi possível carregar o texto do capítulo.");
      } finally {
        setIsLoadingChapter(false);
      }
    };

    window.addEventListener("bibleReadingUpdated", handleReadingUpdate);
    return () => {
      window.removeEventListener("bibleReadingUpdated", handleReadingUpdate);
    };
  }, [liveReading]);

  const renderContent = () => {
    if (error)
      return <AlertTriangle className="text-red-500">{error}</AlertTriangle>;
    if (isLoadingWorship)
      return <LoadingDisplay text="Procurando culto ao vivo..." />;
    if (!activeWorshipId)
      return (
        <div className="text-center">
          <WifiOff className="h-12 w-12 mx-auto" />
          <h2 className="mt-4">Nenhum culto ao vivo no momento</h2>
        </div>
      );
    if (!isConnected)
      return <LoadingDisplay text="Conectando à transmissão..." />;
    if (isLoadingChapter)
      return <LoadingDisplay text="Carregando capítulo..." />;
    if (liveReading) return <LiveReadingDisplay readingState={liveReading} />;

    return <WaitingDisplay />;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {renderContent()}
    </div>
  );
}

// --- Componente Raiz e de Fallback ---
export default function AcompanharCultoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      }
    >
      <main className="flex flex-col items-center bg-gray-50 p-4 min-h-screen">
        <style>{styles}</style>
        <div className="absolute top-4 right-4 z-10">
          <ConnectionBadge />
        </div>
        <div className="w-full flex-grow flex items-center justify-center">
          <AcompanharCultoContent />
        </div>
      </main>
    </Suspense>
  );
}

// Hook isolado para o Badge de conexão
function ConnectionBadge() {
  const searchParams = useSearchParams();
  const worshipIdFromUrl = searchParams.get("worshipId");

  const { data: activeWorship } = useQuery({
    queryKey: ["active-worship-service"],
    queryFn: () => worshipService.findActiveWorshipService(),
    enabled: !worshipIdFromUrl,
  });

  // CORREÇÃO: Garante que o worshipId seja 'number' ou 'null'
  const worshipId: number | null = worshipIdFromUrl
    ? Number(worshipIdFromUrl)
    : activeWorship?.id ?? null;

  const { isConnected } = useSignalRForWorship(worshipId);

  return (
    <Badge
      variant={isConnected ? "default" : "destructive"}
      className="flex items-center gap-1.5 py-1.5 px-3 shadow-md"
    >
      <Zap size={12} className={isConnected ? "animate-pulse" : ""} />
      {isConnected ? "Conectado" : "Desconectado"}
    </Badge>
  );
}
