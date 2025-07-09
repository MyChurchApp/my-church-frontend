"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  BookOpen,
  WifiOff,
  AlertTriangle,
  Zap,
  Heart,
  HandHeart,
  Bell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  worshipService,
  bibleService,
  type BibleVerse,
  type Hymn,
  type PrayerRequest,
} from "@/services/worship/worship";
import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DonationContainer from "@/containers/donation/donationContainer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const styles = `
  body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  .highlighted-part { background-color: #FEFCE8; color: #374151; border-left: 5px solid #FACC15; transform: scale(1.02); transition: all 0.4s ease-in-out; }
  @keyframes gentle-pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 50% { transform: scale(1.05); box-shadow: 0 0 10px 10px rgba(34, 197, 94, 0); } }
  .offering-active-pulse { animation: gentle-pulse 2s infinite; }
`;
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

// --- Componentes de Exibição (sem alterações) ---
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
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-5xl h-[62vh] flex flex-col p-4 sm:p-6 bg-white rounded-2xl shadow-xl border"
    >
      <h1 className="flex-shrink-0 text-3xl sm:text-4xl font-bold text-center text-gray-800 bg-white z-10">
        {readingState.bookName} {readingState.chapterNumber}
      </h1>
      <ScrollArea className="flex-grow">
        <div className="space-y-5">
          {readingState.verses.map((verse) => {
            const isHighlighted = verse.id === readingState.highlightedVerseId;
            return (
              <p
                key={verse.id}
                ref={isHighlighted ? highlightedVerseRef : null}
                className={`text-xl sm:text-2xl text-left leading-relaxed sm:leading-loose text-gray-700 p-2 rounded-lg transition-all duration-300 ${
                  isHighlighted ? "highlighted-part font-medium" : ""
                }`}
              >
                <sup className="font-bold text-blue-600 mr-2 text-lg sm:text-xl">
                  {verse.verseNumber}
                </sup>
                {verse.text}
              </p>
            );
          })}
        </div>
      </ScrollArea>
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
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-5xl h-[65vh] flex flex-col p-4 sm:p-6 bg-white rounded-2xl shadow-xl border"
    >
      <h1 className="flex-shrink-0 text-3xl sm:text-4xl font-bold mb-4 text-center text-gray-800 bg-white pt-2 z-10">
        {hymn.title}
      </h1>
      <ScrollArea className="flex-grow pr-4">
        <div className="space-y-6">
          {hymn.verses.map((verse) => {
            const verseKey = `verse-${verse.number}`;
            const chorusKey = `chorus-after-${verse.number}`;
            const isVerseHighlighted = highlightedPartKey === verseKey;
            const isChorusHighlighted = highlightedPartKey === chorusKey;
            return (
              <React.Fragment key={verse.number}>
                <div
                  ref={isVerseHighlighted ? highlightedPartRef : null}
                  className={`p-4 rounded-lg ${
                    isVerseHighlighted ? "highlighted-part" : ""
                  }`}
                >
                  <h4 className="font-bold text-lg mb-2 text-gray-600">
                    Verso {verse.number}
                  </h4>
                  <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed sm:leading-loose">
                    {formatText(verse.text)}
                  </p>
                </div>
                {hymn.chorus && (
                  <div
                    ref={isChorusHighlighted ? highlightedPartRef : null}
                    className={`italic p-4 rounded-lg ${
                      isChorusHighlighted ? "highlighted-part" : ""
                    }`}
                  >
                    <h4 className="font-bold text-lg mb-2 not-italic text-gray-600">
                      Coro
                    </h4>
                    <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed sm:leading-loose">
                      {formatText(hymn.chorus)}
                    </p>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
};

const WaitingDisplay = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="w-full max-w-2xl p-8"
  >
    <div className="text-center text-gray-500">
      <BookOpen className="h-20 w-20 mx-auto mb-4 text-gray-400" />
      <h2 className="text-2xl sm:text-3xl font-semibold">
        Aguardando transmissão...
      </h2>
      <p className="mt-2 text-base sm:text-lg text-gray-400">
        O conteúdo do culto aparecerá aqui.
      </p>
    </div>
  </motion.div>
);

const LoadingDisplay = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
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
  const [newPrayerRequestText, setNewPrayerRequestText] = useState("");

  // --- ✅ 1. ESTADO PARA O NOVO MODAL DE AVISO ---
  const [showAdminNoticeModal, setShowAdminNoticeModal] = useState(false);
  const [adminNoticeData, setAdminNoticeData] = useState<{
    message: string;
    imageBase64?: string;
  } | null>(null);

  const queryClient = useQueryClient();

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

  const { data: allPrayerRequests = [] } = useQuery<PrayerRequest[]>({
    queryKey: ["prayer-requests", worshipId],
    queryFn: () => worshipService.getPrayerRequests(worshipId!),
    enabled: !!worshipId,
    refetchOnWindowFocus: false,
    select: (data) =>
      [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
  });

  const { mutate: sendPrayerRequestMutation, isPending: isSendingPrayer } =
    useMutation({
      mutationFn: (requestText: string) => {
        if (!worshipId)
          throw new Error("ID do culto não encontrado para enviar a oração.");
        return worshipService.sendPrayerRequest(worshipId, requestText);
      },
      onSuccess: () => {
        setNewPrayerRequestText("");
        queryClient.invalidateQueries({
          queryKey: ["prayer-requests", worshipId],
        });
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

      const { hymn, verseFocus } = event.detail;

      if (!hymn || !hymn.verses) {
        setError("Dados do hino inválidos.");
        return;
      }

      setLiveHymn(hymn as Hymn);
      setDisplayMode("hymn");

      if (verseFocus > 0) {
        setHighlightedPartKey(`verse-${verseFocus}`);
        setLastFocusedVerse(verseFocus);
      } else if (lastFocusedVerse) {
        setHighlightedPartKey(`chorus-after-${lastFocusedVerse}`);
      } else {
        setHighlightedPartKey(null);
      }

      setError(null);
    },
    [lastFocusedVerse]
  );

  const handleOfferingPresent = useCallback(
    () => setIsOfferingActive(true),
    []
  );
  const handleOfferingFinish = useCallback(
    () => setIsOfferingActive(false),
    []
  );

  // --- ✅ 2. LOCAL CORRETO PARA O USEEFFECT DO AVISO ---
  useEffect(() => {
    const handlePrayerReceived = () => {
      queryClient.invalidateQueries({
        queryKey: ["prayer-requests", worshipId],
      });
    };

    // Este é o novo "ouvinte" para o aviso
    const handleAdminNotice = (event: Event) => {
      const notice = (event as CustomEvent).detail;
      setAdminNoticeData(notice);
      setShowAdminNoticeModal(true);
    };

    window.addEventListener("bibleReadingUpdated", handleReadingUpdate);
    window.addEventListener("HymnPresented", handleHymnUpdate);
    window.addEventListener("OfferingPresented", handleOfferingPresent);
    window.addEventListener("OfferingFinished", handleOfferingFinish);
    window.addEventListener("prayerRequestReceived", handlePrayerReceived);
    // Adiciona o novo ouvinte aqui
    window.addEventListener("adminNoticeReceived", handleAdminNotice);

    return () => {
      window.removeEventListener("bibleReadingUpdated", handleReadingUpdate);
      window.removeEventListener("HymnPresented", handleHymnUpdate);
      window.removeEventListener("OfferingPresented", handleOfferingPresent);
      window.removeEventListener("OfferingFinished", handleOfferingFinish);
      window.removeEventListener("prayerRequestReceived", handlePrayerReceived);
      // Remove o novo ouvinte aqui
      window.removeEventListener("adminNoticeReceived", handleAdminNotice);
    };
  }, [
    worshipId,
    queryClient,
    handleReadingUpdate,
    handleHymnUpdate,
    handleOfferingPresent,
    handleOfferingFinish,
  ]);

  const renderContent = () => {
    if (error)
      return (
        <div className="text-center text-red-500 p-8">
          <AlertTriangle className="mx-auto h-16 w-16" />
          <p className="mt-4 text-xl">{error}</p>
        </div>
      );
    if (isLoadingWorship)
      return <LoadingDisplay text="Procurando culto ao vivo..." />;
    if (!worshipId)
      return (
        <div className="text-center text-gray-500 p-8">
          <WifiOff className="h-16 w-16 mx-auto" />
          <h2 className="mt-4 text-2xl">Nenhum culto ao vivo no momento</h2>
        </div>
      );
    if (!isConnected)
      return <LoadingDisplay text="Conectando à transmissão..." />;
    if (isLoadingContent)
      return <LoadingDisplay text="Carregando conteúdo..." />;
    return (
      <AnimatePresence mode="wait">
        {displayMode === "bible" && liveReading && (
          <LiveReadingDisplay readingState={liveReading} />
        )}
        {displayMode === "hymn" && liveHymn && (
          <LiveHymnDisplay
            hymn={liveHymn}
            highlightedPartKey={highlightedPartKey}
          />
        )}
        {displayMode === "waiting" && <WaitingDisplay />}
      </AnimatePresence>
    );
  };

  return (
    <main className="bg-gray-100 w-full min-h-screen flex flex-col">
      <style>{styles}</style>
      <div className="absolute top-4 right-4 z-20">
        <ConnectionBadge isConnected={isConnected} />
      </div>

      <div className="flex-grow w-full flex flex-col items-center justify-center p-4 pt-20 pb-32">
        <div className="w-full flex-grow flex items-center justify-center">
          {renderContent()}
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-30 border-t bg-white/90 p-3 backdrop-blur-sm">
        <div className="container mx-auto max-w-md grid grid-cols-2 items-center gap-3">
          <Button
            onClick={() => setShowPrayerRequestModal(true)}
            className="w-full h-14 text-base font-bold flex items-center justify-center gap-2"
            variant="outline"
          >
            <HandHeart className="h-6 w-6" />
            <span>Orações</span>
          </Button>
          <Button
            onClick={() => setShowOfferingModal(true)}
            className={`w-full h-14 text-base font-bold flex items-center justify-center gap-2 text-white transition-all duration-300 ${
              isOfferingActive
                ? "offering-active-pulse bg-green-600 hover:bg-green-700"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            <Heart className="h-6 w-6" />
            <span>Ofertar</span>
          </Button>
        </div>
      </div>

      {/* MODAL DE DOAÇÃO */}
      <Dialog open={showOfferingModal} onOpenChange={setShowOfferingModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-6">
          <Suspense fallback={<LoadingDisplay text="Carregando doações..." />}>
            {worshipId && <DonationContainer worshipId={worshipId} />}
          </Suspense>
        </DialogContent>
      </Dialog>

      {/* MODAL DE ORAÇÃO */}
      <Dialog
        open={showPrayerRequestModal}
        onOpenChange={setShowPrayerRequestModal}
      >
        <DialogContent className="w-[95vw] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Pedidos de Oração</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-sm font-semibold text-gray-600">
              Pedidos da igreja:
            </Label>
            <ScrollArea className="h-48 w-full rounded-md border bg-gray-50 mt-1">
              <div className="space-y-2 p-3">
                {allPrayerRequests.length > 0 ? (
                  allPrayerRequests.map((p) => (
                    <div
                      key={p.id}
                      className="text-sm p-2 bg-white rounded-md shadow-sm"
                    >
                      <p className="text-gray-800">{p.request}</p>
                      <p className="text-xs text-right text-gray-400 mt-1">
                        {p.memberName}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 p-4">
                    Nenhum pedido de oração enviado ainda.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="pt-2 space-y-3">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="prayer-request" className="font-semibold">
                Enviar meu pedido:
              </Label>
              <Textarea
                placeholder="Escreva seu pedido aqui..."
                id="prayer-request"
                rows={4}
                value={newPrayerRequestText}
                onChange={(e) => setNewPrayerRequestText(e.target.value)}
                className="text-base"
              />
            </div>
            <Button
              className="w-full h-12 text-lg"
              onClick={handleSendPrayerRequest}
              disabled={!newPrayerRequestText.trim() || isSendingPrayer}
            >
              {isSendingPrayer ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Enviar Pedido"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- ✅ 3. NOVO MODAL PARA EXIBIR O AVISO --- */}
      <Dialog
        open={showAdminNoticeModal}
        onOpenChange={setShowAdminNoticeModal}
      >
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader className="items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl text-center">
              Aviso da Administração
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            {adminNoticeData?.imageBase64 && (
              <img
                src={`data:image/jpeg;base64,${adminNoticeData.imageBase64}`}
                alt="Aviso"
                className="max-w-full h-auto rounded-md mb-4"
              />
            )}
            <p className="text-lg text-gray-700 whitespace-pre-wrap">
              {adminNoticeData?.message}
            </p>
          </div>
          <Button
            onClick={() => setShowAdminNoticeModal(false)}
            className="w-full h-11"
          >
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  );
}

// --- Componente de Página (sem alterações) ---
function AcompanharCultoPageContent() {
  const searchParams = useSearchParams();
  const worshipIdFromUrl = searchParams.get("worshipId");
  return <WorshipClient worshipIdFromUrl={worshipIdFromUrl} />;
}

export default function AcompanharCultoPage() {
  return (
    <Suspense fallback={<LoadingDisplay text="Carregando..." />}>
      <AcompanharCultoPageContent />
    </Suspense>
  );
}
