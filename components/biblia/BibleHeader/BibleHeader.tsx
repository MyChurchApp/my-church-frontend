"use client";

import { BibleBook, BibleVersion } from "@/services/biblia/biblia";
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// A interface de props continua a mesma
interface BibleHeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  versionId?: number;
  onVersionChange: (id: number) => void;
  versions: BibleVersion[];
  isLoadingVersions: boolean;
  book?: BibleBook;
  isLoadingBooks: boolean;
  isLoadingChapters: boolean;
  onBookClick: () => void;
  chapter: number;
  onChapterClick: () => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  showBackButton?: boolean;
  onMobileNavClick: () => void;
}

export function BibleHeader({
  book,
  isLoadingBooks,
  isLoadingChapters,
  chapter,
  onPrevChapter,
  onNextChapter,
  showBackButton = true,
  onMobileNavClick,
}: BibleHeaderProps) {
  const router = useRouter();
  const isNavigationDisabled = isLoadingBooks || isLoadingChapters;

  return (
    <header className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 shadow-lg p-2 flex items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-800">
      {/* Botão Voltar (Esquerda) */}
      <div className="w-11">
        {" "}
        {/* Ajustado para alinhar com o botão de ícone */}
        {showBackButton && (
          <Button
            variant="ghost"
            size="lg-icon" // <-- USANDO A NOVA VARIANTE
            onClick={() => router.back()}
            title="Voltar"
          >
            <ArrowLeft size={22} />
          </Button>
        )}
      </div>
      {/* Navegação Central */}
      <div className="flex-grow flex justify-center items-center gap-2">
        {/* Botão Anterior (Fora do bloco) */}
        <Button
          variant="default"
          size="lg-icon" // <-- USANDO A NOVA VARIANTE
          onClick={onPrevChapter}
          title="Capítulo Anterior"
          disabled={isNavigationDisabled}
        >
          <ChevronLeft size={24} />
        </Button>

        {/* Bloco Central (Clicável para abrir o modal) */}
        <Button
          variant="secondary"
          size="lg" // <-- Usando o tamanho 'lg' padrão para altura h-11
          className="flex flex-col h-11 justify-center px-4 w-full max-w-[220px]" // Ajustando padding e alinhamento
          onClick={onMobileNavClick}
        >
          <span className="text-base font-bold truncate max-w-full">
            {isLoadingBooks ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              book?.name || "..."
            )}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Capítulo {chapter}
          </span>
        </Button>

        {/* Botão Próximo (Fora do bloco) */}
        <Button
          variant="default"
          size="lg-icon" // <-- USANDO A NOVA VARIANTE
          onClick={onNextChapter}
          title="Próximo Capítulo"
          disabled={isNavigationDisabled}
        >
          <ChevronRight size={24} />
        </Button>
      </div>
      {/* Espaçador (Direita, para manter o alinhamento) */}
      <div className="w-11"></div>{" "}
      {/* Ajustado para alinhar com o botão de ícone */}
    </header>
  );
}
