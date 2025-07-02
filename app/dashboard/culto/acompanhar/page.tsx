"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  BookOpen,
  Music,
  Megaphone,
  Badge,
  Trash2,
} from "lucide-react";

import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";
import { type BibleVerse } from "@/services/biblia/biblia";
import { Button } from "@/components/ui/button";

// Tipos para as mensagens recebidas
interface BiblePayload {
  bookName: string;
  chapterNumber: number;
  verseStart: number;
  verseEnd: number;
  verses: BibleVerse[];
}

interface HymnPayload {
  title: string;
  text: string;
}

interface AnnouncementPayload {
  text: string;
}

type MessagePayload = BiblePayload | HymnPayload | AnnouncementPayload;

/**
 * Componente para exibir versículos da Bíblia
 */
const BibleDisplay = ({ payload }: { payload: BiblePayload }) => {
  const versesToShow = payload.verses.filter(
    (v) =>
      v.verseNumber >= payload.verseStart && v.verseNumber <= payload.verseEnd
  );

  return (
    <div className="text-center">
      <h1 className="text-3xl md:text-5xl font-bold mb-4">
        {payload.bookName} {payload.chapterNumber}
      </h1>
      <div className="text-lg md:text-2xl text-left leading-relaxed space-y-4">
        {versesToShow.map((verse) => (
          <p key={verse.id}>
            <sup className="font-bold text-blue-600 mr-2">
              {verse.verseNumber}
            </sup>
            {verse.text}
          </p>
        ))}
      </div>
    </div>
  );
};

/**
 * Componente para exibir letras de hinos
 */
const HymnDisplay = ({ payload }: { payload: HymnPayload }) => (
  <div className="text-center">
    <h1 className="text-3xl md:text-5xl font-bold mb-6">{payload.title}</h1>
    {/* Usamos 'whitespace-pre-wrap' para respeitar as quebras de linha do texto */}
    <p className="text-xl md:text-3xl leading-relaxed whitespace-pre-wrap">
      {payload.text}
    </p>
  </div>
);

/**
 * Componente para exibir avisos
 */
const AnnouncementDisplay = ({ payload }: { payload: AnnouncementPayload }) => (
  <div className="text-center">
    <Megaphone className="h-16 w-16 mx-auto mb-6 text-blue-500" />
    <h1 className="text-3xl md:text-5xl font-bold mb-4">Aviso Importante</h1>
    <p className="text-xl md:text-3xl leading-relaxed whitespace-pre-wrap">
      {payload.text}
    </p>
  </div>
);

/**
 * Componente principal que lida com a lógica de acompanhamento
 */
function AcompanharCultoContent() {
  const searchParams = useSearchParams();
  const worshipId = searchParams.get("worshipId");

  const [currentContent, setCurrentContent] = useState<{
    type: string;
    payload: MessagePayload;
  } | null>(null);

  // Conecta ao SignalR usando o ID do culto da URL
  const { latestMessage, isConnected } = useSignalRForWorship(
    worshipId ? Number(worshipId) : null
  );

  // Atualiza o conteúdo a ser exibido sempre que uma nova mensagem chega
  useEffect(() => {
    if (latestMessage) {
      setCurrentContent(latestMessage);
    }
  }, [latestMessage]);

  const renderContent = () => {
    if (!currentContent) {
      return (
        <div className="text-center text-gray-500">
          <BookOpen className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Aguardando transmissão...</h2>
          <p>O conteúdo do culto aparecerá aqui em tempo real.</p>
        </div>
      );
    }

    switch (currentContent.type) {
      case "bible":
        return (
          <BibleDisplay payload={currentContent.payload as BiblePayload} />
        );
      case "hymn":
        return <HymnDisplay payload={currentContent.payload as HymnPayload} />;
      case "announcement":
        return (
          <AnnouncementDisplay
            payload={currentContent.payload as AnnouncementPayload}
          />
        );
      default:
        return <p>Tipo de conteúdo desconhecido.</p>;
    }
  };

  if (!worshipId) {
    return (
      <div className="p-6 text-center text-red-500">
        ID do culto não fornecido na URL.
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-2xl">
        {!isConnected ? (
          <div className="text-center text-gray-500">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
            <h2 className="text-2xl font-semibold">
              Conectando à transmissão...
            </h2>
          </div>
        ) : (
          renderContent()
        )}
      </div>
      <div className="absolute top-4 right-4">
        <Button variant="destructive" size="icon">
          {/* O ícone é estilizado com 'className' para cor, tamanho, etc. */}
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}

/**
 * Página que envolve o conteúdo com Suspense para carregar os parâmetros da URL
 */
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
