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

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Presentation,
  getPresentationById,
} from "@/services/presentation/presentation";

// --- Tipos de Dados ---
interface SlidePointer {
  presentationId: number;
  slideIndex: number; // Corresponde ao 'orderIndex' do backend
}

// --- Componente Visualizador de Slide (Unificado) ---
function SlideViewer({ slidePointer }: { slidePointer: SlidePointer | null }) {
  const [currentSlideUrl, setCurrentSlideUrl] = useState<string | null>(null);
  const [presentationCache, setPresentationCache] =
    useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndDisplaySlide = async () => {
      if (!slidePointer) {
        setCurrentSlideUrl(null);
        setIsLoading(false);
        return;
      }

      const { presentationId, slideIndex } = slidePointer;
      setIsLoading(true);
      setError(null);

      try {
        let presentationToUse = presentationCache;

        // Se a apresentação em cache não existe ou o ID mudou, busca uma nova.
        if (!presentationToUse || presentationToUse.id !== presentationId) {
          const newPresentationData = await getPresentationById(presentationId);
          setPresentationCache(newPresentationData);
          presentationToUse = newPresentationData;
        }

        if (presentationToUse?.slides) {
          let targetSlide = presentationToUse.slides.find(
            (s) => s.orderIndex === slideIndex
          );

          // Se o slide não foi encontrado, a apresentação pode ter sido atualizada no backend.
          // Busca os dados novamente para garantir que temos a lista de slides mais recente.
          if (!targetSlide) {
            const freshPresentationData = await getPresentationById(
              presentationId
            );
            setPresentationCache(freshPresentationData);
            targetSlide = freshPresentationData.slides.find(
              (s) => s.orderIndex === slideIndex
            );
          }

          if (targetSlide) {
            setCurrentSlideUrl(targetSlide.cachedMediaUrl);
          } else {
            throw new Error(
              `Slide com índice ${slideIndex} não foi encontrado na apresentação.`
            );
          }
        } else {
          throw new Error("Apresentação carregada não contém slides.");
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar o slide.");
        setCurrentSlideUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndDisplaySlide();
  }, [slidePointer, presentationCache]); // Depende do cache para re-avaliar

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
  if (currentSlideUrl) {
    return (
      <motion.div
        key={currentSlideUrl} // A chave é a URL da imagem para garantir a animação na troca
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full h-full"
      >
        <img
          src={currentSlideUrl}
          alt={`Slide`}
          className="w-full h-full object-contain"
        />
      </motion.div>
    );
  }

  return <div className="text-white text-2xl">Aguardando apresentação...</div>;
}

// --- Componente Principal da Página ---
function SlidePageInner() {
  const pageRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  const id = params.get("id");

  // O estado agora é unificado para apontar para um slide específico
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
    // Função para tratar o evento de leitura da Bíblia
    const handleBibleReading = (event: Event) => {
      const customEvent = event as CustomEvent<{
        presentationId: number;
        slideIndex: number;
      }>;
      if (customEvent.detail) {
        setActiveSlidePointer({
          presentationId: customEvent.detail.presentationId,
          slideIndex: customEvent.detail.slideIndex,
        });
      }
    };

    // Função para tratar o evento de apresentação do Hino
    const handleHymn = (event: Event) => {
      const customEvent = event as CustomEvent<{
        presentationId: number;
        currentSlideIndex: number;
      }>;
      if (customEvent.detail) {
        setActiveSlidePointer({
          presentationId: customEvent.detail.presentationId,
          slideIndex: customEvent.detail.currentSlideIndex, // Usa o campo correto do evento de hino
        });
      }
    };

    window.addEventListener("bibleReadingUpdated", handleBibleReading);
    window.addEventListener("HymnPresented", handleHymn);

    return () => {
      window.removeEventListener("bibleReadingUpdated", handleBibleReading);
      window.removeEventListener("HymnPresented", handleHymn);
    };
  }, []);

  return (
    <div
      ref={pageRef}
      className="bg-black w-screen h-screen flex items-center justify-center cursor-pointer select-none outline-none"
      tabIndex={0}
      onClick={toggleFullscreen}
    >
      <AnimatePresence mode="wait">
        <div
          key={
            activeSlidePointer
              ? activeSlidePointer.presentationId +
                "-" +
                activeSlidePointer.slideIndex
              : "waiting"
          }
          className="w-full h-full flex items-center justify-center"
        >
          <SlideViewer slidePointer={activeSlidePointer} />
        </div>
      </AnimatePresence>
      {!activeSlidePointer && (
        <div className="text-center text-white absolute">
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
