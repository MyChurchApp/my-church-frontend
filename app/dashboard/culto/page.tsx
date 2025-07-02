"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen, WifiOff, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { worshipService } from "@/services/worship/worship";
import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";
import { type BibleVerse } from "@/services/biblia/biblia";

// --- Componentes de Exibição ---
const BibleDisplay = ({
  apiData,
  verseId,
}: {
  apiData: any;
  verseId: number;
}) => {
  const { bookName, chapterNumber, content } = apiData;
  const verseToShow = Array.isArray(content)
    ? content.find((v: BibleVerse) => v.id === verseId)
    : content;

  return (
    <div className="text-center animate-fade-in">
      <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800">
        {bookName} {chapterNumber}
      </h1>
      <div className="text-lg md:text-2xl text-left leading-relaxed text-gray-700">
        {verseToShow ? (
          <p>
            <sup className="font-bold text-blue-600 mr-2">
              {verseToShow.verseNumber}
            </sup>
            {verseToShow.text}
          </p>
        ) : (
          <p className="italic">Versículo não encontrado.</p>
        )}
      </div>
    </div>
  );
};
const WaitingDisplay = () => (
  <div className="text-center text-gray-500">
    <BookOpen className="h-16 w-16 mx-auto mb-4" />
    <h2 className="text-2xl font-semibold">Aguardando transmissão...</h2>
  </div>
);
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="text-center text-red-600">
    <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
    <h2 className="text-2xl font-semibold">Erro na Transmissão</h2>
    <p>{message}</p>
  </div>
);

// --- Lógica Principal da Página ---
function AcompanharCultoContent() {
  const searchParams = useSearchParams();
  const worshipIdFromUrl = searchParams.get("worshipId");
  const [activeWorshipId, setActiveWorshipId] = useState<number | null>(
    worshipIdFromUrl ? Number(worshipIdFromUrl) : null
  );
  const [reading, setReading] = useState<any>(null); // Armazena o 'detail' do evento

  const { data: activeWorship, isLoading } = useQuery({
    queryKey: ["active-worship-service"],
    queryFn: () => worshipService.findActiveWorshipService(),
    enabled: !worshipIdFromUrl,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (worshipIdFromUrl) setActiveWorshipId(Number(worshipIdFromUrl));
    else if (activeWorship) setActiveWorshipId(activeWorship.id);
  }, [activeWorship, worshipIdFromUrl]);

  const { isConnected } = useSignalRForWorship(activeWorshipId);

  useEffect(() => {
    const handleReadingUpdate = (event: CustomEvent) => {
      console.log(
        "Evento 'bibleReadingUpdated' recebido na página:",
        event.detail
      );
      setReading(event.detail);
    };

    window.addEventListener(
      "bibleReadingUpdated",
      handleReadingUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "bibleReadingUpdated",
        handleReadingUpdate as EventListener
      );
    };
  }, []);

  const renderContent = () => {
    if (!isConnected)
      return (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin" />
          <h2 className="mt-4 text-2xl">Conectando...</h2>
        </div>
      );
    if (reading?.error) return <ErrorDisplay message={reading.errorMessage} />;
    if (reading?.apiData)
      return (
        <BibleDisplay apiData={reading.apiData} verseId={reading.verseId} />
      );
    return <WaitingDisplay />;
  };

  if (isLoading && !worshipIdFromUrl)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
        <h2 className="mt-4 text-2xl">Procurando culto ao vivo...</h2>
      </div>
    );
  if (!activeWorshipId)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <WifiOff className="h-12 w-12" />
        <h2 className="mt-4 text-2xl">Nenhum culto ao vivo no momento</h2>
      </div>
    );

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-2xl min-h-[400px] flex items-center justify-center">
        {renderContent()}
      </div>
      <div className="absolute top-4 right-4">
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Conectado" : "Desconectado"}
        </Badge>
      </div>
    </main>
  );
}

export default function AcompanharCultoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      }
    >
      <AcompanharCultoContent />
    </Suspense>
  );
}
