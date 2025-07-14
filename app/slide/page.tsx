"use client";

import React, {
  Suspense,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";
import { useSearchParams } from "next/navigation";
import {
  getPresentationById,
  type Presentation,
  type Slide,
} from "../../services/presentation/presentation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Loader2, Maximize, Minimize, CheckCircle } from "lucide-react";

//=========== TIPOS E CONSTANTES ===========//
interface SlidePointer {
  presentationId: number;
  slideIndex: number;
}

const slideVariants: Variants = {
  enter: {
    opacity: 0,
  },
  center: {
    zIndex: 1,
    opacity: 1,
  },
  exit: {
    zIndex: 0,
    opacity: 0,
  },
};

//=========== COMPONENTES DE CARREGAMENTO ===========//

type LoadingStage = "connecting" | "waiting" | "loading-data" | "preloading";

interface LoadingOverlayProps {
  stage: LoadingStage;
  progress?: number;
}

const loadingMessages = {
  connecting: "Conectando ao serviço de apresentação...",
  waiting: "Conexão estabelecida! Aguardando o início...",
  "loading-data": "Recebendo dados da apresentação...",
  preloading: "Preparando os slides...",
};

function LoadingOverlay({ stage, progress = 0 }: LoadingOverlayProps) {
  const [connectProgress, setConnectProgress] = useState(0);

  useEffect(() => {
    if (stage === "connecting") {
      setConnectProgress(0);
      const interval = setInterval(() => {
        setConnectProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [stage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white"
    >
      <div className="w-full max-w-md p-4 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-xl mb-6"
          >
            {loadingMessages[stage]}
          </motion.p>
        </AnimatePresence>
        {(stage === "connecting" || stage === "preloading") && (
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <motion.div
              className="bg-blue-500 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${
                  stage === "connecting" ? connectProgress : progress
                }%`,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        )}
        {stage === "waiting" && (
          <div className="flex justify-center items-center space-x-3 text-green-400">
            <CheckCircle size={24} />
            <span className="animate-pulse">Aguardando...</span>
          </div>
        )}
        {stage === "loading-data" && (
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        )}
      </div>
    </motion.div>
  );
}

// Componente para o loading sutil
function SubtleLoadingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white/90"
    >
      <Loader2 className="h-5 w-5 animate-spin" />
    </motion.div>
  );
}

//=========== COMPONENTE VISUALIZADOR DE SLIDE (CORRIGIDO) ===========//

function SlideViewer({ slide }: { slide: Slide | null }) {
  if (!slide) return null;
  return (
    // A CORREÇÃO PRINCIPAL: `mode="wait"` foi removido para permitir a transição cruzada.
    <AnimatePresence initial={false}>
      <motion.div
        key={slide.id}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        // Transição muito rápida para a sensação de troca instantânea.
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute w-full h-full flex items-center justify-center"
      >
        <img
          src={slide.cachedMediaUrl}
          alt={`Slide ${slide.orderIndex}`}
          className="w-full h-full object-contain"
        />
      </motion.div>
    </AnimatePresence>
  );
}

//=========== COMPONENTE INTERNO DA PÁGINA ===========//

function SlidePageInner() {
  const pageRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  const worshipServiceId = params.get("id");

  const [presentationCache, setPresentationCache] =
    useState<Presentation | null>(null);
  const [activeSlidePointer, setActiveSlidePointer] =
    useState<SlidePointer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [displayedSlide, setDisplayedSlide] = useState<Slide | null>(null);

  const { isConnected } = useSignalRForWorship(Number(worshipServiceId));
  const preloadedUrls = useRef(new Set<string>()).current;

  // Efeito 1: Lida com a busca de dados da apresentação
  useEffect(() => {
    const fetchPresentationData = async (presentationId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const presentation = await getPresentationById(presentationId);
        setPresentationCache(presentation);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar a apresentação.");
        setPresentationCache(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!activeSlidePointer) return;

    const { presentationId, slideIndex } = activeSlidePointer;
    const isSlideInMemory = presentationCache?.slides.some(
      (s) => s.orderIndex === slideIndex
    );
    const isSamePresentation = presentationCache?.id === presentationId;

    if ((!isSamePresentation || !isSlideInMemory) && !isLoading) {
      fetchPresentationData(presentationId);
    }
  }, [activeSlidePointer, presentationCache, isLoading]);

  // Efeito 2: Atualiza o slide visível
  useEffect(() => {
    if (!activeSlidePointer || !presentationCache) return;
    const targetSlide = presentationCache.slides.find(
      (s) => s.orderIndex === activeSlidePointer.slideIndex
    );
    if (targetSlide) {
      setDisplayedSlide(targetSlide);
    }
  }, [activeSlidePointer, presentationCache]);

  // Efeito 3: Pré-carrega as imagens
  useEffect(() => {
    if (!presentationCache?.slides) return;
    const imageUrls = presentationCache.slides
      .map((slide) => slide.cachedMediaUrl)
      .filter(Boolean);
    const imagesToPreload = imageUrls.filter((url) => !preloadedUrls.has(url));
    if (imagesToPreload.length === 0) return;
    const preload = async () => {
      setIsPreloading(true);
      setPreloadProgress(0);
      let loadedCount = 0;
      const totalToLoad = imagesToPreload.length;
      const promises = imagesToPreload.map((url) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = img.onerror = () => {
            loadedCount++;
            preloadedUrls.add(url);
            setPreloadProgress((loadedCount / totalToLoad) * 100);
            resolve();
          };
        });
      });
      await Promise.all(promises);
      setIsPreloading(false);
    };
    preload();
  }, [presentationCache, preloadedUrls]);

  // Efeito 4: Escuta os eventos do SignalR
  useEffect(() => {
    const handleSlideUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      const detail = customEvent.detail;
      const presentationId = detail.presentationId;
      const slideIndex = detail.slideIndex ?? detail.currentSlideIndex;
      if (
        typeof presentationId === "number" &&
        typeof slideIndex === "number"
      ) {
        setActiveSlidePointer({ presentationId, slideIndex });
      }
    };
    window.addEventListener("bibleReadingUpdated", handleSlideUpdate);
    window.addEventListener("HymnPresented", handleSlideUpdate);
    return () => {
      window.removeEventListener("bibleReadingUpdated", handleSlideUpdate);
      window.removeEventListener("HymnPresented", handleSlideUpdate);
    };
  }, []);

  // Lógica de navegação por teclado
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        !presentationCache?.slides ||
        !activeSlidePointer ||
        isPreloading ||
        isLoading
      )
        return;
      const sortedSlides = [...presentationCache.slides].sort(
        (a, b) => a.orderIndex - b.orderIndex
      );
      const currentArrayIndex = sortedSlides.findIndex(
        (s) => s.orderIndex === activeSlidePointer.slideIndex
      );
      if (currentArrayIndex === -1) return;
      let nextArrayIndex = currentArrayIndex;
      if (event.key === "ArrowRight") {
        nextArrayIndex = Math.min(
          currentArrayIndex + 1,
          sortedSlides.length - 1
        );
      } else if (event.key === "ArrowLeft") {
        nextArrayIndex = Math.max(currentArrayIndex - 1, 0);
      }
      if (nextArrayIndex !== currentArrayIndex) {
        const nextSlide = sortedSlides[nextArrayIndex];
        setActiveSlidePointer({
          presentationId: activeSlidePointer.presentationId,
          slideIndex: nextSlide.orderIndex,
        });
      }
    },
    [activeSlidePointer, presentationCache, isPreloading, isLoading]
  );

  // Lógica de tela cheia
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      pageRef.current?.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
    }
  }, []);
  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Lógica para decidir qual indicador de loading mostrar
  const isInitialLoad = !displayedSlide;
  const isBackgroundActivity = isLoading || isPreloading;

  const showFullScreenOverlay =
    isInitialLoad && (!isConnected || isBackgroundActivity);
  const showSubtleLoader = !isInitialLoad && isLoading; // Apenas o isLoading, pois o preload já é uma ação de fundo que não precisa de indicador.

  let fullScreenStage: LoadingStage | null = null;
  if (!isConnected) {
    fullScreenStage = "connecting";
  } else if (isLoading) {
    fullScreenStage = "loading-data";
  } else if (isPreloading) {
    fullScreenStage = "preloading";
  } else if (!activeSlidePointer) {
    fullScreenStage = "waiting";
  }

  return (
    <div
      ref={pageRef}
      className="bg-gradient-to-br from-gray-900 to-black w-screen h-screen flex items-center justify-center select-none outline-none relative group"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      autoFocus
    >
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-20 p-2 bg-black/30 rounded-full text-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-white hover:bg-black/50"
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      <AnimatePresence>
        {showFullScreenOverlay && fullScreenStage && (
          <LoadingOverlay stage={fullScreenStage} progress={preloadProgress} />
        )}
      </AnimatePresence>

      {error && (
        <div className="text-red-500 text-2xl bg-black p-4 rounded-md z-10">
          {error}
        </div>
      )}

      <SlideViewer slide={displayedSlide} />

      <AnimatePresence>
        {showSubtleLoader && <SubtleLoadingIndicator />}
      </AnimatePresence>
    </div>
  );
}

//=========== COMPONENTE PRINCIPAL (EXPORT) ===========//
export default function SlidePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-black w-screen h-screen flex items-center justify-center text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SlidePageInner />
    </Suspense>
  );
}
