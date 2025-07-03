"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query"; // ✅ useMutation importado
import {
  Loader2,
  BookOpen,
  WifiOff,
  AlertTriangle,
  Zap,
  Heart,
  HandHeart,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DonationContainer from "@/containers/donation/donationContainer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { ScrollArea } from "@/components/ui/scroll-area";
import { PulsingBorderButton } from "./components/PulsingGlowButton/PulsingGlowButton";

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

// --- Componentes de Exibição ---
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
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [isOfferingActive, setIsOfferingActive] = useState(false);
  const [showPrayerRequestModal, setShowPrayerRequestModal] = useState(false);

  const [prayerRequests, setPrayerRequests] = useState<string[]>([]);
  const [newPrayerRequestText, setNewPrayerRequestText] = useState("");

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

  // ✅ Mutação para enviar o pedido de oração
  const { mutate: sendPrayerRequestMutation, isPending: isSendingPrayer } =
    useMutation({
      mutationFn: (requestText: string) => {
        if (!worshipId)
          throw new Error("ID do culto não encontrado para enviar a oração.");
        return worshipService.sendPrayerRequest(worshipId, requestText);
      },
      onSuccess: (_, sentRequestText) => {
        setPrayerRequests((prev) => [...prev, sentRequestText]);
        setNewPrayerRequestText("");
        setShowPrayerRequestModal(false);
        // alert("Pedido de oração enviado com sucesso!"); // Pode substituir por um toast
      },
      onError: (err: any) => {
        alert(`Erro ao enviar pedido de oração: ${err.message}`);
      },
    });

  const handleSendPrayerRequest = () => {
    if (!newPrayerRequestText.trim()) return;
    sendPrayerRequestMutation(newPrayerRequestText);
  };

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

  const handleOfferingPresent = useCallback(() => {
    setIsOfferingActive(true);
  }, []);

  const handleOfferingFinish = useCallback(() => {
    setIsOfferingActive(false);
  }, []);

  useEffect(() => {
    window.addEventListener("bibleReadingUpdated", handleReadingUpdate);
    window.addEventListener("HymnPresented", handleHymnUpdate);
    window.addEventListener("OfferingPresented", handleOfferingPresent);
    window.addEventListener("OfferingFinished", handleOfferingFinish);

    return () => {
      window.removeEventListener("bibleReadingUpdated", handleReadingUpdate);
      window.removeEventListener("HymnPresented", handleHymnUpdate);
      window.removeEventListener("OfferingPresented", handleOfferingPresent);
      window.removeEventListener("OfferingFinished", handleOfferingFinish);
    };
  }, [
    handleReadingUpdate,
    handleHymnUpdate,
    handleOfferingPresent,
    handleOfferingFinish,
  ]);

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
    <main className="flex flex-col items-center bg-gray-50 p-4 min-h-screen w-full pb-48 sm:pb-32">
      <style>{styles}</style>
      <div className="absolute top-4 right-4 z-10">
        <ConnectionBadge isConnected={isConnected} />
      </div>
      <div className="w-full flex-grow flex items-center justify-center">
        {renderContent()}
      </div>

      {prayerRequests.length > 0 && (
        <div className="w-full max-w-lg mt-6">
          <h3 className="text-center font-semibold mb-2 text-gray-700">
            Meus Pedidos Enviados
          </h3>
          <div className="relative">
            <ScrollArea className="h-32 w-full rounded-md border bg-white/70">
              <div className="space-y-2 p-3 pb-8">
                {prayerRequests.map((request, index) => (
                  <p
                    key={index}
                    className="text-sm p-2 bg-white rounded-md shadow-sm text-gray-800"
                  >
                    {request}
                  </p>
                ))}
              </div>
            </ScrollArea>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none rounded-b-md" />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t p-4 z-20">
        <div className="container mx-auto max-w-lg flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={() => setShowPrayerRequestModal(true)}
            className="w-full sm:w-auto flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm py-3 px-6 h-14 rounded-lg shadow-xl transition duration-300 ease-in-out transform hover:scale-105"
          >
            <HandHeart className="h-6 w-6 mr-2" />
            Pedido de Oração
          </Button>
          <div className="w-full sm:w-auto flex-1">
            <PulsingBorderButton
              isActive={isOfferingActive}
              onClick={() => setShowOfferingModal(true)}
            />
          </div>
        </div>
      </div>

      <Dialog open={showOfferingModal} onOpenChange={setShowOfferingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <Suspense
            fallback={<div className="p-10 text-center">Carregando...</div>}
          >
            {worshipId && <DonationContainer worshipId={worshipId} />}
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showPrayerRequestModal}
        onOpenChange={setShowPrayerRequestModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pedido de Oração</DialogTitle>
            <DialogDescription>
              Deixe seu pedido de oração abaixo. Ele será recebido pela equipe
              de intercessão.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="prayer-request">Seu pedido:</Label>
              <Textarea
                placeholder="Escreva seu pedido aqui..."
                id="prayer-request"
                rows={6}
                value={newPrayerRequestText}
                onChange={(e) => setNewPrayerRequestText(e.target.value)}
              />
            </div>
            {/* ✅ Botão atualizado com estado de carregamento */}
            <Button
              className="w-full"
              onClick={handleSendPrayerRequest}
              disabled={!newPrayerRequestText.trim() || isSendingPrayer}
            >
              {isSendingPrayer && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enviar Pedido
            </Button>
          </div>
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
