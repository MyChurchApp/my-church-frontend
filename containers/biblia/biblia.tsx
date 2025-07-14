"use client";

import { useState } from "react";
import { BibleHeader } from "@/components/biblia/BibleHeader/BibleHeader";
import { BibleContent } from "@/components/biblia/BibleContent/BibleContent";
import { ChapterModal } from "@/components/biblia/ChapterModal/ChapterPopover";
import { VerseActionTooltip } from "@/components/biblia/VerseActionTooltip/VerseActionTooltip";
import BookModal from "@/components/biblia/BookModal/BookModal";
import { GeminiModal } from "@/components/biblia/GeminiModal/GeminiModal";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useBibleReader } from "./useBibleReader";
import { NavigationModal } from "@/components/biblia/BibleHeader/NavigationModal";

interface BibleContainerConfig {
  showBackButton?: boolean;
  enableGemini?: boolean;
}

interface BibleContainerProps {
  config?: BibleContainerConfig;
}

export function BibleContainer({ config = {} }: BibleContainerProps) {
  const { showBackButton = true, enableGemini = false } = config;
  const { state, refs, loading, handlers } = useBibleReader();
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("light");

  const handleCopy = () => {
    if (state.tooltip?.text) {
      navigator.clipboard.writeText(
        `"${state.tooltip.text}" (${state.tooltip.verseReference})`
      );
      handlers.setTooltip(null);
    }
  };

  const handleShare = () => {
    if (state.tooltip?.verseReference && state.tooltip?.text) {
      navigator.share({
        title: `Versículo da Bíblia: ${state.tooltip.verseReference}`,
        text: `"${state.tooltip.text}" - ${state.tooltip.verseReference}`,
      });
      handlers.setTooltip(null);
    }
  };

  const handleSelectBook = (bookId: number) => {
    const newBook = state.books.find((b) => b.id === bookId);
    if (newBook) {
      handlers.setBook(newBook);
    }
    setIsBookModalOpen(false);
  };

  const handleSelectChapter = (chapterNumber: number) => {
    handlers.setChapter(chapterNumber);
    setIsChapterModalOpen(false);
  };

  const toggleUiVisibility = () => setIsUiVisible((prev) => !prev);

  return (
    <div
      className={`relative min-h-screen flex flex-col font-serif transition-colors duration-300 ${
        theme === "sepia" ? "bg-[#f9f5f0]" : "bg-gray-50 dark:bg-gray-950"
      }`}
    >
      <AnimatePresence>
        {isUiVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 z-20"
          >
            <BibleHeader
              isDarkMode={state.isDarkMode}
              onToggleTheme={() => handlers.setIsDarkMode(!state.isDarkMode)}
              versionId={state.versionId}
              onVersionChange={handlers.setVersionId}
              versions={state.versions}
              isLoadingVersions={loading.isLoadingVersions}
              book={state.book}
              isLoadingBooks={loading.isLoadingBooks}
              isLoadingChapters={loading.isLoadingChapters}
              onBookClick={() => setIsBookModalOpen(true)}
              chapter={state.chapter}
              onChapterClick={() => setIsChapterModalOpen(true)}
              onPrevChapter={handlers.handlePrevChapter}
              onNextChapter={handlers.handleNextChapter}
              showBackButton={showBackButton}
              onMobileNavClick={() => setIsNavModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        onClick={handlers.handlePrevChapter}
        className="fixed left-0 top-0 h-full w-[25vw] z-0"
      />
      <div
        onClick={handlers.handleNextChapter}
        className="fixed right-0 top-0 h-full w-[25vw] z-0"
      />
      <div
        onClick={toggleUiVisibility}
        className="fixed left-[25vw] top-0 h-full w-[50vw] z-0"
      />

      <main
        ref={refs.mainContentRef}
        className="flex-grow pb-4 md:pb-6 max-w-2xl mx-auto w-full z-10"
      >
        {loading.showGlobalLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <BibleContent
            book={state.book}
            chapter={state.chapter}
            verses={state.verses}
            isLoading={loading.isLoadingVerses}
            onVerseClick={(e, verse) => {
              e.stopPropagation();
              handlers.handleVerseClick(e, verse);
            }}
            theme={theme}
          />
        )}
      </main>

      <VerseActionTooltip
        tooltip={state.tooltip}
        onClose={() => handlers.setTooltip(null)}
        onCopy={handleCopy}
        onShare={handleShare}
        onExplain={handlers.handleExplainWithGemini}
        isGeminiLoading={state.isGeminiLoading}
        showExplainButton={enableGemini}
      />

      <ChapterModal
        open={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        chapters={state.chapters}
        currentChapter={state.chapter}
        onSelectChapter={handleSelectChapter}
        isLoading={loading.isLoadingChapters}
        bookName={state.book?.name}
      />

      <BookModal
        open={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        books={state.books}
        currentBookId={state.book?.id}
        onSelectBook={handleSelectBook}
        isLoading={loading.isLoadingBooks}
      />

      {enableGemini && (
        <GeminiModal
          open={state.isGeminiModalOpen}
          onClose={() => handlers.setIsGeminiModalOpen(false)}
          data={state.geminiFullResponse}
          isLoading={state.isGeminiLoading}
        />
      )}

      <NavigationModal
        isOpen={isNavModalOpen}
        onClose={() => setIsNavModalOpen(false)}
        versions={state.versions}
        currentVersionId={state.versionId}
        onVersionChange={handlers.setVersionId}
        currentBook={state.book}
        onBookSelectClick={() => {
          setIsNavModalOpen(false);
          setIsBookModalOpen(true);
        }}
        currentChapter={state.chapter}
        onChapterSelectClick={() => {
          setIsNavModalOpen(false);
          setIsChapterModalOpen(true);
        }}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
}
