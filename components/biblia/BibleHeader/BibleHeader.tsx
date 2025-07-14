"use client";

import { BibleBook, BibleVersion } from "@/services/biblia/biblia";
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      <div className="w-11">
        {" "}
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
      <div className="flex-grow flex justify-center items-center gap-2">
        <Button
          variant="default"
          size="lg-icon"
          onClick={onPrevChapter}
          title="Capítulo Anterior"
          disabled={isNavigationDisabled}
        >
          <ChevronLeft size={24} />
        </Button>

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
      <div className="w-11"></div>{" "}
    </header>
  );
}
