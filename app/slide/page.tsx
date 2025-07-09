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
} from "../../services/presentation/presentation"; // Ajuste o caminho se necessário
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

// --- Tipos de Dados ---
interface SlidePointer {
  presentationId: number;
  slideIndex: number; // Corresponde ao 'orderIndex' do backend
}

// --- Componente Visualizador de Slide (Otimizado) ---
function SlideViewer({ slidePointer }: { slidePointer: SlidePointer | null }) {
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [presentationCache, setPresentationCache] =
    useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efeito para pré-carregar a imagem do próximo slide
  useEffect(() => {
    if (!presentationCache || !currentSlide) return;

    const currentIndex = presentationCache.slides.findIndex(
      (s) => s.id === currentSlide.id
    );
    if (
      currentIndex !== -1 &&
      currentIndex + 1 < presentationCache.slides.length
    ) {
      const nextSlide = presentationCache.slides[currentIndex + 1];
      if (nextSlide?.cachedMediaUrl) {
        const img = new Image();
        img.src = nextSlide.cachedMediaUrl;
      }
    }
  }, [currentSlide, presentationCache]);

  useEffect(() => {
    const fetchSlide = async () => {
      if (!slidePointer) {
        setCurrentSlide(null);
        setIsLoading(false);
        return;
      }

      // Não mostra o loading para trocas de slide, apenas na carga inicial de uma nova apresentação.
      if (
        !presentationCache ||
        presentationCache.id !== slidePointer.presentationId
      ) {
        setIsLoading(true);
      }
      setError(null);

      try {
        let presentation = presentationCache;
        if (!presentation || presentation.id !== slidePointer.presentationId) {
          presentation = await getPresentationById(slidePointer.presentationId);
          setPresentationCache(presentation);
        }

        const slide = presentation.slides.find(
          (s) => s.orderIndex === slidePointer.slideIndex
        );

        if (slide) {
          setCurrentSlide(slide);
        } else {
          // Se o slide não for encontrado, a apresentação pode ter sido atualizada.
          // Força uma nova busca.
          const freshPresentation = await getPresentationById(
            slidePointer.presentationId
          );
          setPresentationCache(freshPresentation);
          const freshSlide = freshPresentation.slides.find(
            (s) => s.orderIndex === slidePointer.slideIndex
          );
          if (freshSlide) {
            setCurrentSlide(freshSlide);
          } else {
            throw new Error(
              `Slide com índice ${slidePointer.slideIndex} não encontrado.`
            );
          }
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar slide.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlide();
  }, [slidePointer]);

  if (isLoading) {
    return <Loader2 className="h-12 w-12 animate-spin text-white" />;
  }
  if (error) {
    return (
      <div className="text-red-500 text-2xl bg-black p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {currentSlide?.cachedMediaUrl && (
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute w-full h-full"
        >
          <img
            src={currentSlide.cachedMediaUrl}
            alt={`Slide ${currentSlide.orderIndex}`}
            className="w-full h-full object-contain"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Componente Principal da Página ---
function SlidePageInner() {
  const pageRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  const id = params.get("id");
  const [activeSlidePointer, setActiveSlidePointer] =
    useState<SlidePointer | null>(null);
  const { isConnected } = useSignalRForWorship(Number(id));

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      pageRef.current?.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleSlideUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      const detail = customEvent.detail;

      if (detail && typeof detail.presentationId === "number") {
        const slideIndex =
          typeof detail.slideIndex === "number"
            ? detail.slideIndex
            : detail.currentSlideIndex;
        if (typeof slideIndex === "number") {
          setActiveSlidePointer({
            presentationId: detail.presentationId,
            slideIndex: slideIndex,
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

  return (
    <div
      ref={pageRef}
      className="bg-black w-screen h-screen flex items-center justify-center cursor-pointer select-none outline-none relative"
      tabIndex={0}
      onClick={toggleFullscreen}
    >
      <SlideViewer slidePointer={activeSlidePointer} />

      {!activeSlidePointer && (
        <div className="text-center text-white z-10">
          <p className="text-2xl">Aguardando o início da apresentação...</p>
          <div className="mt-4">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              } text-white`}
            >
              {isConnected ? "CONECTADO" : "DESCONECTADO"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

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
