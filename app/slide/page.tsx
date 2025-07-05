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
import { SlideViewer } from "./components/SliderViewer"; // verifique o caminho!

interface SlideData {
  presentationId: number;
  slideIndex: number;
}

function SlidePageInner() {
  const pageRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  const id = params.get("id");
  const [activeSlide, setActiveSlide] = useState<SlideData | null>(null);
  const { isConnected } = useSignalRForWorship(Number(id));

  const enterFullscreen = useCallback(() => {
    const elem = pageRef.current;
    if (elem) elem.requestFullscreen?.();
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
  }, []);

  const toggleFullscreen = useCallback(() => {
    document.fullscreenElement ? exitFullscreen() : enterFullscreen();
  }, [enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitFullscreen();
      if (e.key === "Enter") enterFullscreen();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleBibleReading = (event: Event) => {
      const customEvent = event as CustomEvent<SlideData>;
      setActiveSlide(customEvent.detail);
    };
    const handleHymn = (event: Event) => {
      const customEvent = event as CustomEvent<SlideData>;
      setActiveSlide(customEvent.detail);
    };
    const handleAdminNotice = () => setActiveSlide(null);

    window.addEventListener("bibleReadingUpdated", handleBibleReading);
    window.addEventListener("HymnPresented", handleHymn);
    window.addEventListener("adminNoticeReceived", handleAdminNotice);

    return () => {
      window.removeEventListener("bibleReadingUpdated", handleBibleReading);
      window.removeEventListener("HymnPresented", handleHymn);
      window.removeEventListener("adminNoticeReceived", handleAdminNotice);
    };
  }, []);

  useEffect(() => {
    pageRef.current?.focus();
  }, []);

  return (
    <div
      ref={pageRef}
      className="bg-black"
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
      }}
      tabIndex={0}
      onClick={toggleFullscreen}
    >
      {activeSlide ? (
        <SlideViewer data={activeSlide} />
      ) : (
        <div className="text-center">
          <p className="text-white" style={{ fontSize: "1.5rem" }}>
            Aguardando o início da apresentação...
          </p>
          <div className="mt-4">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              } text-white`}
            >
              {isConnected ? "CONECTADO" : "DESCONECTADO"}
            </span>
            <p className="text-gray-400 text-sm mt-2">
              A apresentação aparecerá aqui automaticamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Aqui está o ponto da correção: exporta já com <Suspense>
export default function SlidePage() {
  return (
    <Suspense fallback={null}>
      <SlidePageInner />
    </Suspense>
  );
}
