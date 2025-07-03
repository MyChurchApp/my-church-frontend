"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  BookOpen,
  WifiOff,
  AlertTriangle,
  Zap,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  worshipService,
  bibleService,
  type BibleVerse,
  type Hymn,
} from "@/services/worship/worship";
import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DonationContainer from "@/containers/donation/donationContainer";
import { Button } from "@/components/ui/button";

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

// --- Tipos ---
type DisplayMode = "bible" | "hymn" | "waiting";

interface LiveReadingState {
  bookName: string;
  chapterNumber: number;
  chapterId: number;
  highlightedVerseId: number;
  verses: BibleVerse[];
}

type BibleTransmission = {
  activityId: number;
  versionId: number;
  bookId: number;
  chapterId: number;
  verseId: number;
};

// --- Componentes burros ---
const LiveReadingDisplay = ({
  readingState,
}: {
  readingState: LiveReadingState;
}) => {
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

const ConnectionBadge = ({ isConnected }: { isConnected: boolean }) => (
  <Badge
    variant={isConnected ? "default" : "destructive"}
    className="flex items-center gap-1.5 py-1.5 px-3 shadow-md"
  >
    <Zap size={12} className={isConnected ? "animate-pulse" : ""} />
    {isConnected ? "Conectado" : "Desconectado"}
  </Badge>
);

// --- Função de comparação de transmissão ---
function isOnlyVerseChanged(
  before: BibleTransmission | null,
  now: BibleTransmission
): boolean {
  if (!before) return false;
  return (
    before.activityId === now.activityId &&
    before.versionId === now.versionId &&
    before.bookId === now.bookId &&
    before.chapterId === now.chapterId &&
    before.verseId !== now.verseId
  );
}

// --- Componente principal ---
function WorshipClient({
  worshipIdFromUrl,
}: {
  worshipIdFromUrl: string | null;
}) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("waiting");
  const [liveReading, setLiveReading] = useState<LiveReadingState | null>(null);
  const [liveHymn, setLiveHymn] = useState<Hymn | null>(null);
  const [highlightedPartKey, setHighlightedPartKey] = useState<string | null>(
    null
  );
  const [lastFocusedVerse, setLastFocusedVerse] = useState<number | null>(null);
  const [cachedVerses, setCachedVerses] = useState<{
    [chapterId: number]: BibleVerse[];
  }>({});
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTransmission, setLastTransmission] =
    useState<BibleTransmission | null>(null);
  const [showOfferingModal, setShowOfferingModal] = useState(false); // NOVO ESTADO

  const { data: activeWorship, isLoading: isLoadingWorship } = useQuery({
    queryKey: ["active-worship-service"],
    queryFn: () => worshipService.findActiveWorshipService(),
    enabled: !worshipIdFromUrl,
    refetchInterval: 30000,
  });

  const worshipId = worshipIdFromUrl
    ? Number(worshipIdFromUrl)
    : activeWorship?.id ?? null;
  const { isConnected } = useSignalRForWorship(worshipId);
  const handleReadingUpdate = useCallback(
    async (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const {
        activityId,
        versionId,
        bookId,
        chapterId,
        verseId,
        bookName,
        chapterNumber,
      } = event.detail;

      const now: BibleTransmission = {
        activityId,
        versionId,
        bookId,
        chapterId,
        verseId,
      };
      if (isOnlyVerseChanged(lastTransmission, now)) {
        setLiveReading((prev) =>
          prev ? { ...prev, highlightedVerseId: verseId } : prev
        );
        setLastTransmission(now);
        return;
      }

      setIsLoadingContent(true);

      try {
        let verses: BibleVerse[];

        if (cachedVerses[chapterId]) {
          verses = cachedVerses[chapterId];
        } else {
          verses = await bibleService.getVersesByChapterId(chapterId);
          setCachedVerses((prev) => ({ ...prev, [chapterId]: verses }));
        }
        setLiveReading({
          bookName,
          chapterNumber,
          chapterId,
          highlightedVerseId: verseId,
          verses,
        });
        setDisplayMode("bible");
        setError(null);
        setLastTransmission(now);
      } catch (err: any) {
        setError("Falha ao carregar texto bíblico: " + err.message);
      } finally {
        setIsLoadingContent(false);
      }
    },
    [lastTransmission, cachedVerses]
  );

  const handleHymnUpdate = useCallback(
    (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const { hymnDto, verseFocus } = event.detail;
      if (!hymnDto || !hymnDto.verses) {
        setError("Dados do hino inválidos.");
        return;
      }
      setLiveHymn(hymnDto as Hymn);
      setDisplayMode("hymn");
      if (verseFocus > 0) {
        setHighlightedPartKey(`verse-${verseFocus}`);
        setLastFocusedVerse(verseFocus);
      } else if (lastFocusedVerse) {
        setHighlightedPartKey(`chorus-after-${lastFocusedVerse}`);
      }
      setError(null);
    },
    [lastFocusedVerse]
  );

  useEffect(() => {
    window.removeEventListener("bibleReadingUpdated", handleReadingUpdate);
    window.removeEventListener("HymnPresented", handleHymnUpdate);

    window.addEventListener("bibleReadingUpdated", handleReadingUpdate);
    window.addEventListener("HymnPresented", handleHymnUpdate);

    return () => {
      window.removeEventListener("bibleReadingUpdated", handleReadingUpdate);
      window.removeEventListener("HymnPresented", handleHymnUpdate);
    };
  }, [handleReadingUpdate, handleHymnUpdate]);

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
    if (!worshipId)
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
    <main className="flex flex-col items-center bg-gray-50 p-4 min-h-screen w-full">
      <style>{styles}</style>
      <div className="absolute top-4 right-4 z-10">
        <ConnectionBadge isConnected={isConnected} />
      </div>
      <div className="w-full flex-grow flex items-center justify-center">
        {renderContent()}
      </div>

      {/* Barra de Ações Inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t p-4 z-20">
        <div className="container mx-auto max-w-md">
          <Button
            className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg"
            onClick={() => setShowOfferingModal(true)}
          >
            <Heart className=" h-6 w-6" />
            Ofertar no Culto
          </Button>
        </div>
      </div>

      {/* Modal de Doação */}
      <Dialog open={showOfferingModal} onOpenChange={setShowOfferingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <Suspense
            fallback={<div className="p-10 text-center">Carregando...</div>}
          >
            <DonationContainer worshipId={worshipId} />
          </Suspense>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function AcompanharCultoPageContent() {
  const searchParams = useSearchParams();
  const worshipIdFromUrl = searchParams.get("worshipId");
  return <WorshipClient worshipIdFromUrl={worshipIdFromUrl} />;
}

export default function AcompanharCultoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      }
    >
      <AcompanharCultoPageContent />
    </Suspense>
  );
}
