"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  bibleService,
  type BibleBook,
  type BibleVerse,
  type TooltipState,
} from "@/services/biblia/biblia";
import { useRouter } from "next/navigation";

export function useBibleReader() {
  const [versionId, setVersionId] = useState<number | undefined>();
  const [book, setBook] = useState<BibleBook | undefined>();
  const [chapter, setChapter] = useState<number>(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [geminiFullResponse, setGeminiFullResponse] = useState<any>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const router = useRouter();
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const { data: versions = [], isLoading: isLoadingVersions } = useQuery({
    queryKey: ["bible-versions"],
    queryFn: bibleService.getVersions,
    staleTime: Infinity,
  });

  const { data: books = [], isLoading: isLoadingBooks } = useQuery({
    queryKey: ["bible-books", versionId],
    queryFn: () => (versionId ? bibleService.getBooksByVersion(versionId) : []),
    enabled: !!versionId,
    staleTime: Infinity,
  });

  const { data: chapters = [], isLoading: isLoadingChapters } = useQuery({
    queryKey: ["bible-chapters", book?.id],
    queryFn: () => (book ? bibleService.getChaptersByBookId(book.id) : []),
    enabled: !!book,
    staleTime: Infinity,
  });

  const chapterId = useMemo(
    () => chapters.find((c) => c.chapterNumber === chapter)?.id,
    [chapters, chapter]
  );

  const { data: verses = [], isLoading: isLoadingVerses } = useQuery<
    BibleVerse[]
  >({
    queryKey: ["bible-verses", chapterId],
    queryFn: () =>
      chapterId ? bibleService.getVersesByChapterId(chapterId) : [],
    enabled: !!chapterId,
    staleTime: 0,
  });

  useEffect(() => {
    if (versions.length && !versionId) setVersionId(versions[0].id);
  }, [versions, versionId]);

  useEffect(() => {
    if (books.length && (!book || !books.some((b) => b.id === book.id))) {
      setBook(books[0]);
      setChapter(1);
    }
  }, [books, book]);

  useEffect(() => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setTooltip(null);
  }, [verses]);

  const handleNextChapter = useCallback(() => {
    if (isLoadingChapters || isLoadingVerses) return;
    const totalChapters = chapters.length;
    if (chapter < totalChapters) {
      setChapter((prev) => prev + 1);
    } else {
      const currentBookIndex = books.findIndex((b) => b.id === book?.id);
      if (currentBookIndex < books.length - 1) {
        setBook(books[currentBookIndex + 1]);
        setChapter(1);
      }
    }
  }, [chapters, chapter, books, book, isLoadingChapters, isLoadingVerses]);

  const handlePrevChapter = useCallback(() => {
    if (isLoadingChapters || isLoadingVerses) return;
    if (chapter > 1) {
      setChapter((prev) => prev - 1);
    } else {
      const currentBookIndex = books.findIndex((b) => b.id === book?.id);
      if (currentBookIndex > 0) {
        const prevBook = books[currentBookIndex - 1];
        setBook(prevBook);
        setChapter(1);
      }
    }
  }, [chapter, books, book, isLoadingChapters, isLoadingVerses]);

  const handleVerseClick = (
    event: React.MouseEvent<HTMLParagraphElement>,
    verse: BibleVerse
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      verseId: verse.verseNumber,
      text: verse.text,
      verseText: verse.text,
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 10,
      width: rect.width,
      height: rect.height,
      verseReference: `${book?.abbreviation || ""} ${chapter}:${
        verse.verseNumber
      }`,
    });
  };

  const handleExplainWithGemini = async () => {
    if (!tooltip?.text || !tooltip?.verseReference) return;
    setIsGeminiLoading(true);
    setIsGeminiModalOpen(true);
    setTooltip(null);
    try {
      const resp = await bibleService.explainWithGemini(
        tooltip.text,
        tooltip.verseReference
      );
      setGeminiFullResponse(resp);
    } catch (error) {
      console.error("Gemini explanation failed:", error);
      setGeminiFullResponse(null);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  return {
    state: {
      isDarkMode,
      versionId,
      versions,
      book,
      books,
      chapter,
      chapters,
      verses,
      tooltip,
      isGeminiModalOpen,
      geminiFullResponse,
      isGeminiLoading,
    },
    refs: {
      mainContentRef,
    },
    loading: {
      isLoadingVersions,
      isLoadingBooks,
      isLoadingChapters,
      isLoadingVerses,
      showGlobalLoading: isLoadingVersions || isLoadingBooks,
    },
    handlers: {
      router,
      setIsDarkMode,
      setVersionId,
      setBook,
      setChapter,
      setTooltip,
      handleNextChapter,
      handlePrevChapter,
      handleVerseClick,
      handleExplainWithGemini,
      setIsGeminiModalOpen,
    },
  };
}
