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
    // O <header> continua ocupando 100% da largura da tela...
    <header className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800">
      {/* ...mas agora, um <div> interno centraliza o conteúdo para alinhar com a página. */}
      <div className="p-2 flex items-center ">
        {/* Botão Voltar (Esquerda) */}
        <div className="w-11 flex-shrink-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="lg-icon"
              onClick={() => router.back()}
              title="Voltar"
            >
              <ArrowLeft size={22} />
            </Button>
          )}
        </div>

        {/* Navegação Central */}
        <div className="flex-grow flex justify-center items-center gap-2">
          {/* Botão Anterior */}
          <Button
            variant="default"
            size="lg-icon"
            onClick={onPrevChapter}
            title="Capítulo Anterior"
            disabled={isNavigationDisabled}
          >
            <ChevronLeft size={24} />
          </Button>

          {/* Bloco Central Clicável */}
          <Button
            variant="secondary"
            size="lg"
            className="flex flex-col h-11 justify-center px-4 w-full max-w-[220px]"
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

          {/* Botão Próximo */}
          <Button
            variant="default"
            size="lg-icon"
            onClick={onNextChapter}
            title="Próximo Capítulo"
            disabled={isNavigationDisabled}
          >
            <ChevronRight size={24} />
          </Button>
        </div>

        {/* Espaçador (Direita, para manter o alinhamento) */}
        <div className="w-11 flex-shrink-0"></div>
      </div>
    </header>
  );
}
