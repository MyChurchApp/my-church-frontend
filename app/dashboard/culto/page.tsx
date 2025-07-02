"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  BookOpen,
  WifiOff,
  AlertTriangle,
  Zap,
  Music,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  worshipService,
  bibleService,
  hymnService,
  type BibleVerse,
  type Hymn,
  type HymnVerse,
} from "@/services/worship/worship";
import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";
import { motion } from "framer-motion";

// --- Estilos ---
const styles = `
  .highlighted-part {
    background-color: rgba(250, 204, 21, 0.2);
    color: #1f2937;
    padding: 12px;
    border-radius: 8px;
    border-left: 4px solid #facc15;
    transform: scale(1.01);
    transition: all 0.4s ease-in-out;
  }
`;

// --- Tipos de Estado ---
type DisplayMode = "bible" | "hymn" | "waiting";

interface LiveReadingState {
  bookName: string;
  chapterNumber: number;
  highlightedVerseId: number;
  verses: BibleVerse[];
}

// ===================================================================
//   COMPONENTES DE EXIBIÇÃO
// ===================================================================

const LiveReadingDisplay = ({
  readingState,
}: {
  readingState: LiveReadingState;
}) => {
  // Implementação do componente de leitura da Bíblia (sem alterações)
  const highlightedVerseRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    highlightedVerseRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [readingState.highlightedVerseId]);

  return (
    <motion.div
      key="bible-display"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl h-[75vh] flex flex-col p-6 md:p-8 bg-white rounded-2xl shadow-2xl border"
    >
      <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center text-gray-800 sticky top-0 bg-white pb-4 z-10">
        {readingState.bookName} {readingState.chapterNumber}
      </h1>
      <div className="overflow-y-auto pr-4 space-y-4">
        {readingState.verses.map((verse) => {
          const isHighlighted = verse.id === readingState.highlightedVerseId;
          return (
            <p
              key={verse.id}
              ref={isHighlighted ? highlightedVerseRef : null}
              className={`text-lg md:text-xl text-left leading-relaxed text-gray-700 ${
                isHighlighted ? "highlighted-part font-semibold" : ""
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

// Componente de Hino com lógica de destaque corrigida
const LiveHymnDisplay = ({
  hymn,
  highlightedPartKey,
}: {
  hymn: Hymn;
  highlightedPartKey: string | null;
}) => {
  const highlightedPartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightedPartRef.current) {
      highlightedPartRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedPartKey]);

  const formatText = (text: string | null) => {
    if (!text) return null;
    return text.split("<br>").map((line, index) => (
      <React.Fragment key={index}>
        {line.trim()}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <motion.div
      key="hymn-display"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl h-[75vh] flex flex-col p-6 md:p-8 bg-white rounded-2xl shadow-2xl border"
    >
      <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center text-gray-800 sticky top-0 bg-white pb-4 z-10">
        {hymn.title}
      </h1>
      <div className="overflow-y-auto pr-4 space-y-4">
        {hymn.verses.map((verse) => {
          const verseKey = `verse-${verse.number}`;
          const chorusKey = `chorus-after-${verse.number}`;
          const isVerseHighlighted = highlightedPartKey === verseKey;
          const isChorusHighlighted = highlightedPartKey === chorusKey;

          return (
            <React.Fragment key={verse.number}>
              <div
                ref={isVerseHighlighted ? highlightedPartRef : null}
                className={`p-3 rounded-md ${
                  isVerseHighlighted ? "highlighted-part" : ""
                }`}
              >
                <h4 className="font-semibold mb-1">Verso {verse.number}</h4>
                <p className="text-gray-700">{formatText(verse.text)}</p>
              </div>
              {hymn.chorus && (
                <div
                  ref={isChorusHighlighted ? highlightedPartRef : null}
                  className={`italic p-3 rounded-md ${
                    isChorusHighlighted ? "highlighted-part" : ""
                  }`}
                >
                  <h4 className="font-semibold mb-1 not-italic">Coro</h4>
                  <p className="text-gray-700">{formatText(hymn.chorus)}</p>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </motion.div>
  );
};

const WaitingDisplay = () => (
  <div className="w-full max-w-4xl p-8 bg-white rounded-2xl shadow-lg min-h-[400px] flex items-center justify-center">
    <div className="text-center text-gray-500">
      <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h2 className="text-2xl font-semibold">Aguardando transmissão...</h2>
      <p className="mt-2 text-gray-400">O conteúdo do culto aparecerá aqui.</p>
    </div>
  </div>
);

const LoadingDisplay = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
    <h2 className="mt-4 text-2xl text-gray-700">{text}</h2>
  </div>
);

// ===================================================================
//   LÓGICA PRINCIPAL DA PÁGINA
// ===================================================================
function AcompanharCultoContent() {
  const searchParams = useSearchParams();
  const worshipIdFromUrl = searchParams.get("worshipId");
  const [activeWorshipId, setActiveWorshipId] = useState<number | null>(
    worshipIdFromUrl ? Number(worshipIdFromUrl) : null
  );

  const [displayMode, setDisplayMode] = useState<DisplayMode>("waiting");
  const [liveReading, setLiveReading] = useState<LiveReadingState | null>(null);
  const [liveHymn, setLiveHymn] = useState<Hymn | null>(null);
  const [highlightedPartKey, setHighlightedPartKey] = useState<string | null>(
    null
  );
  const [lastFocusedVerse, setLastFocusedVerse] = useState<number | null>(null); // ✅ NOVO ESTADO
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: activeWorship, isLoading: isLoadingWorship } = useQuery({
    queryKey: ["active-worship-service"],
    queryFn: () => worshipService.findActiveWorshipService(),
    enabled: !worshipIdFromUrl,
    refetchInterval: 30000,
  });

  useEffect(() => {
    setActiveWorshipId(
      worshipIdFromUrl ? Number(worshipIdFromUrl) : activeWorship?.id ?? null
    );
  }, [activeWorship, worshipIdFromUrl]);

  const { isConnected } = useSignalRForWorship(activeWorshipId);

  useEffect(() => {
    const handleReadingUpdate = async (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const readingEventData = event.detail.apiData;
      const { bookName, chapterNumber, chapterId, verseId } = readingEventData;
      if (!bookName || !chapterNumber || !chapterId || !verseId) {
        setError("Dados da Bíblia insuficientes.");
        return;
      }
      try {
        setIsLoadingContent(true);
        const verses = await bibleService.getVersesByChapterId(chapterId);
        setLiveReading({
          bookName,
          chapterNumber,
          highlightedVerseId: verseId,
          verses,
        });
        setDisplayMode("bible");
        setError(null);
      } catch (err: any) {
        setError("Falha ao carregar texto bíblico: " + err.message);
      } finally {
        setIsLoadingContent(false);
      }
    };

    const handleHymnUpdate = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const eventData = event.detail;
      console.log("Evento 'HymnPresented' processado:", eventData);

      const hymnData = eventData.hymnDto;
      const verseFocus = eventData.verseFocus;

      if (!hymnData || !hymnData.verses) {
        setError("Dados do hino inválidos.");
        return;
      }

      setLiveHymn(hymnData as Hymn);
      setDisplayMode("hymn");

      // ✅ LÓGICA DE DESTAQUE CORRIGIDA
      if (verseFocus > 0) {
        // Se for um verso, o foco é direto e guardamos o número
        setHighlightedPartKey(`verse-${verseFocus}`);
        setLastFocusedVerse(verseFocus);
      } else {
        // Se for um coro (0), usamos o último verso focado para criar a chave
        if (lastFocusedVerse) {
          setHighlightedPartKey(`chorus-after-${lastFocusedVerse}`);
        }
      }
      setError(null);
    };

    window.addEventListener("bibleReadingUpdated", handleReadingUpdate);
    window.addEventListener("HymnPresented", handleHymnUpdate);

    return () => {
      window.removeEventListener("bibleReadingUpdated", handleReadingUpdate);
      window.removeEventListener("HymnPresented", handleHymnUpdate);
    };
  }, [lastFocusedVerse]); // Adiciona lastFocusedVerse como dependência

  const renderContent = () => {
    if (error)
      return (
        <div className="text-center text-red-500">
          <AlertTriangle className="mx-auto h-12 w-12" />
          <p className="mt-4">{error}</p>
        </div>
      );
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
    if (isLoadingContent)
      return <LoadingDisplay text="Carregando conteúdo..." />;

    switch (displayMode) {
      case "bible":
        return liveReading ? (
          <LiveReadingDisplay readingState={liveReading} />
        ) : (
          <WaitingDisplay />
        );
      case "hymn":
        return liveHymn ? (
          <LiveHymnDisplay
            hymn={liveHymn}
            highlightedPartKey={highlightedPartKey}
          />
        ) : (
          <WaitingDisplay />
        );
      default:
        return <WaitingDisplay />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {renderContent()}
    </div>
  );
}

// ===================================================================
//   COMPONENTE RAIZ DA PÁGINA
// ===================================================================
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

function ConnectionBadge() {
  const searchParams = useSearchParams();
  const worshipIdFromUrl = searchParams.get("worshipId");
  const { data: activeWorship } = useQuery({
    queryKey: ["active-worship-service"],
    queryFn: () => worshipService.findActiveWorshipService(),
    enabled: !worshipIdFromUrl,
  });
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
