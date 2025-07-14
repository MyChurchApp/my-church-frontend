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
} from "../../../services/presentation/presentation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Maximize, Minimize, CheckCircle } from "lucide-react";

//=========== TIPOS E CONSTANTES ===========//

interface SlidePointer {
  presentationId: number;
  slideIndex: number;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

//=========== COMPONENTE DE OVERLAY DE CARREGAMENTO (MODIFICADO) ===========//

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

  const displayProgress = stage === "connecting" ? connectProgress : progress;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white">
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
              animate={{ width: `${displayProgress}%` }}
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
    </div>
  );
}

//=========== COMPONENTE VISUALIZADOR DE SLIDE ===========//

function SlideViewer({
  slide,
  direction,
}: {
  slide: Slide | null;
  direction: number;
}) {
  if (!slide?.cachedMediaUrl) return null;

  return (
    <AnimatePresence initial={false} custom={direction}>
      <motion.div
        key={slide.id}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className="absolute w-full h-full"
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

//=========== COMPONENTE INTERNO DA PÁGINA (MODIFICADO) ===========//

function SlidePageInner() {
  const pageRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  const id = params.get("id");

  const [presentationCache, setPresentationCache] =
    useState<Presentation | null>(null);
  const [activeSlidePointer, setActiveSlidePointer] =
    useState<SlidePointer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [preloadedImageUrls, setPreloadedImageUrls] = useState<Set<string>>(
    new Set()
  );
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);

  const { isConnected } = useSignalRForWorship(Number(id));
  const prevSlideIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchPresentationForSlide = async (pointer: SlidePointer) => {
      if (
        !presentationCache ||
        presentationCache.id !== pointer.presentationId
      ) {
        setIsLoading(true);
        setError(null);
        try {
          const presentation = await getPresentationById(
            pointer.presentationId
          );
          setPresentationCache(presentation);
        } catch (err: any) {
          setError(err.message || "Erro ao carregar a apresentação.");
          setPresentationCache(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (activeSlidePointer) {
      fetchPresentationForSlide(activeSlidePointer);
    }
  }, [activeSlidePointer]);

  // Efeito para pré-carregar as imagens
  useEffect(() => {
    if (!presentationCache?.slides) return;

    const imageUrls = presentationCache.slides
      .map((slide) => slide.cachedMediaUrl)
      .filter(Boolean);
    const imagesToPreload = imageUrls.filter(
      (url) => !preloadedImageUrls.has(url)
    );

    if (imagesToPreload.length === 0) {
      return;
    }

    const preload = async () => {
      setIsPreloading(true);
      setPreloadProgress(0);
      let loadedCount = 0;
      const totalToLoad = imagesToPreload.length;

      const promises = imagesToPreload.map((url) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            loadedCount++;
            setPreloadedImageUrls((prev) => new Set(prev).add(url));
            setPreloadProgress((loadedCount / totalToLoad) * 100);
            resolve();
          };
          img.onerror = () => {
            // Mesmo com erro, continua para não travar o processo
            loadedCount++;
            setPreloadProgress((loadedCount / totalToLoad) * 100);
            resolve();
          };
        });
      });

      await Promise.all(promises);
      setIsPreloading(false);
    };

    preload();
  }, [presentationCache, preloadedImageUrls]);

  useEffect(() => {
    const handleSlideUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      const detail = customEvent.detail;
      if (detail && typeof detail.presentationId === "number") {
        const slideIndex =
          typeof detail.currentSlideIndex === "number"
            ? detail.currentSlideIndex
            : detail.slideIndex;

        if (typeof slideIndex === "number") {
          setActiveSlidePointer((prev) => {
            if (prev) {
              prevSlideIndexRef.current = prev.slideIndex;
            }
            return {
              presentationId: detail.presentationId,
              slideIndex: slideIndex,
            };
          });
        }
      }
    };
    window.addEventListener("bibleReadingUpdated", handleSlideUpdate);
    window.addEventListener("HymnPresented", handleSlideUpdate);
    return () => {
      window.removeEventListener("bibleReadingUpdated", handleSlideUpdate);
      window.removeEventListener("HymnPresented", handleSlideUpdate);
    };
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!presentationCache || activeSlidePointer === null || isPreloading)
        return;

      const totalSlides = presentationCache.slides.length;
      let nextSlideIndex = activeSlidePointer.slideIndex;

      if (event.key === "ArrowRight") {
        nextSlideIndex = Math.min(
          activeSlidePointer.slideIndex + 1,
          totalSlides > 0 ? totalSlides - 1 : 0
        );
      } else if (event.key === "ArrowLeft") {
        nextSlideIndex = Math.max(activeSlidePointer.slideIndex - 1, 0);
      }

      if (nextSlideIndex !== activeSlidePointer.slideIndex) {
        prevSlideIndexRef.current = activeSlidePointer.slideIndex;
        setActiveSlidePointer({
          ...activeSlidePointer,
          slideIndex: nextSlideIndex,
        });
      }
    },
    [activeSlidePointer, presentationCache, isPreloading]
  );

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

  const currentSlide = presentationCache?.slides.find(
    (s) => s.orderIndex === activeSlidePointer?.slideIndex
  );

  const direction =
    (activeSlidePointer?.slideIndex ?? 0) > (prevSlideIndexRef.current ?? -1)
      ? 1
      : -1;

  let stage: LoadingStage | null = null;
  if (!isConnected) {
    stage = "connecting";
  } else if (!activeSlidePointer && !isLoading && !isPreloading) {
    stage = "waiting";
  } else if (isLoading) {
    stage = "loading-data";
  } else if (isPreloading) {
    stage = "preloading";
  }

  const showLoadingOverlay = stage !== null && stage !== "waiting";

  return (
    <div
      ref={pageRef}
      className="bg-gradient-to-br from-gray-900 to-black w-screen h-screen flex items-center justify-center select-none outline-none relative group"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-20 p-2 bg-black/30 rounded-full text-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-white hover:bg-black/50"
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      <AnimatePresence>
        {showLoadingOverlay && stage && (
          <LoadingOverlay stage={stage} progress={preloadProgress} />
        )}
      </AnimatePresence>

      {error && (
        <div className="text-red-500 text-2xl bg-black p-4 rounded-md z-10">
          {error}
        </div>
      )}

      {!showLoadingOverlay && (
        <SlideViewer slide={currentSlide || null} direction={direction} />
      )}
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
