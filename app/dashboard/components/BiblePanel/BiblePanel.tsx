"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  bibleService,
  worshipService,
  type BibleVersion,
  type BibleBook,
  type BibleChapter,
  type BibleVerse,
} from "@/services/worship/worship";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";
import { Combobox, ComboboxOption } from "../combobox/combobox";

interface BiblePanelProps {
  worshipId: number;
  selectedVersion: BibleVersion | null;
  setSelectedVersion: React.Dispatch<React.SetStateAction<BibleVersion | null>>;
  selectedBook: BibleBook | null;
  setSelectedBook: React.Dispatch<React.SetStateAction<BibleBook | null>>;
  selectedChapter: BibleChapter | null;
  setSelectedChapter: React.Dispatch<React.SetStateAction<BibleChapter | null>>;
  selectedVerse: BibleVerse | null;
  setSelectedVerse: React.Dispatch<React.SetStateAction<BibleVerse | null>>;
}

export default function BiblePanel({
  worshipId,
  selectedVersion,
  setSelectedVersion,
  selectedBook,
  setSelectedBook,
  selectedChapter,
  setSelectedChapter,
  selectedVerse,
  setSelectedVerse,
}: BiblePanelProps) {
  const activeVerseRef = useRef<HTMLDivElement>(null);

  const { data: versions = [], isLoading: isLoadingVersions } = useQuery<
    BibleVersion[]
  >({ queryKey: ["bible-versions"], queryFn: bibleService.getVersions });
  const { data: books = [], isLoading: isLoadingBooks } = useQuery<BibleBook[]>(
    {
      queryKey: ["bible-books", selectedVersion?.id],
      queryFn: () => bibleService.getBooksByVersion(selectedVersion!.id),
      enabled: !!selectedVersion,
    }
  );
  const { data: chapters = [], isLoading: isLoadingChapters } = useQuery<
    BibleChapter[]
  >({
    queryKey: ["bible-chapters", selectedBook?.id],
    queryFn: () => bibleService.getChaptersByBookId(selectedBook!.id),
    enabled: !!selectedBook,
  });
  const { data: verses = [], isLoading: isLoadingVerses } = useQuery<
    BibleVerse[]
  >({
    queryKey: ["bible-verses", selectedChapter?.id],
    queryFn: () => bibleService.getVersesByChapterId(selectedChapter!.id),
    enabled: !!selectedChapter,
  });

  const { mutate: highlightVerse, isPending: isBroadcasting } = useMutation({
    mutationFn: (params: {
      versionId: number;
      bookId: number;
      chapterId: number;
      verseId: number;
    }) => worshipService.highlightBibleReading(worshipId, params),
    onSuccess: (_, variables) => {
      const verse = verses.find((v) => v.id === variables.verseId);
      if (verse) setSelectedVerse(verse);
    },
    onError: (err: any) => alert(`Erro ao transmitir: ${err.message}`),
  });

  useEffect(() => {
    activeVerseRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [selectedVerse]);

  const transmitVerse = useCallback(
    (verse: BibleVerse) => {
      if (!selectedVersion || !selectedBook || !selectedChapter) return;
      highlightVerse({
        versionId: selectedVersion.id,
        bookId: selectedBook.id,
        chapterId: selectedChapter.id,
        verseId: verse.id,
      });
    },
    [selectedVersion, selectedBook, selectedChapter, highlightVerse]
  );

  const handleNavigation = useCallback(
    (direction: "next" | "prev") => {
      if (verses.length === 0) return;
      const currentIndex = selectedVerse
        ? verses.findIndex((v) => v.id === selectedVerse.id)
        : -1;
      let nextIndex =
        direction === "next" ? currentIndex + 1 : currentIndex - 1;

      if (currentIndex === -1 && verses.length > 0) {
        nextIndex = 0;
      }

      if (nextIndex >= 0 && nextIndex < verses.length) {
        transmitVerse(verses[nextIndex]);
      }
    },
    [verses, selectedVerse, transmitVerse]
  );

  const resetSelections = (level: "version" | "book" | "chapter") => {
    if (level === "version") setSelectedBook(null);
    if (level === "version" || level === "book") setSelectedChapter(null);
    setSelectedVerse(null);
  };

  const versionOptions: ComboboxOption[] = versions.map((v) => ({
    value: String(v.id),
    label: v.name,
  }));
  const bookOptions: ComboboxOption[] = books.map((b) => ({
    value: String(b.id),
    label: b.name,
  }));
  const chapterOptions: ComboboxOption[] = chapters.map((c) => ({
    value: String(c.id),
    label: `Capítulo ${c.chapterNumber}`,
  }));

  const currentVerseIndex = selectedVerse
    ? verses.findIndex((v) => v.id === selectedVerse.id)
    : -1;
  const canGoPrev = currentVerseIndex > 0;
  const canGoNext =
    currentVerseIndex !== -1 && currentVerseIndex < verses.length - 1;

  return (
    <Card className="border-0 shadow-none bg-transparent flex flex-col h-full">
      <CardHeader className="px-1 pt-1 flex-shrink-0">
        <CardTitle>Leitura Bíblica</CardTitle>
        <CardDescription>
          Selecione e transmita os versículos para a tela principal.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2 pt-4">
          <div className="lg:col-span-5">
            <Combobox
              options={versionOptions}
              value={selectedVersion?.id.toString()}
              onValueChange={(value) => {
                setSelectedVersion(
                  versions.find((v) => v.id === Number(value)) ?? null
                );
                resetSelections("version");
              }}
              placeholder="Versão"
              searchPlaceholder="Buscar versão..."
              disabled={isLoadingVersions}
            />
          </div>
          <div className="lg:col-span-4">
            <Combobox
              options={bookOptions}
              value={selectedBook?.id.toString()}
              onValueChange={(value) => {
                setSelectedBook(
                  books.find((b) => b.id === Number(value)) ?? null
                );
                resetSelections("book");
              }}
              placeholder="Livro"
              searchPlaceholder="Buscar livro..."
              disabled={!selectedVersion || isLoadingBooks}
            />
          </div>
          <div className="lg:col-span-3">
            <Combobox
              options={chapterOptions}
              value={selectedChapter?.id.toString()}
              onValueChange={(value) => {
                setSelectedChapter(
                  chapters.find((c) => c.id === Number(value)) ?? null
                );
                resetSelections("chapter");
              }}
              placeholder="Capítulo"
              searchPlaceholder="Buscar capítulo..."
              disabled={!selectedBook || isLoadingChapters}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 mt-4 flex-grow overflow-hidden">
        {/* ✅ MUDANÇA 1: A altura da área de scroll foi aumentada */}
        <ScrollArea className="h-full border rounded-lg bg-white dark:bg-gray-900/50">
          <div className="p-2 space-y-1">
            {isLoadingVerses ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : verses.length > 0 ? (
              verses.map((verse) => {
                const isSelected = selectedVerse?.id === verse.id;
                return (
                  <div
                    key={verse.id}
                    ref={isSelected ? activeVerseRef : null}
                    onClick={() => setSelectedVerse(verse)}
                    // ✅ MUDANÇA 2: A fonte foi diminuída de text-base para text-sm
                    className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors text-sm ${
                      isSelected
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 ring-2 ring-blue-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <sup className="font-bold text-gray-500 dark:text-gray-400 w-6 text-right mt-1">
                      {verse.verseNumber}
                    </sup>
                    {/* ✅ MUDANÇA 3: A entrelinha foi ajustada para ficar mais compacta */}
                    <p className="flex-1 leading-normal">{verse.text}</p>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                <BookOpen className="h-10 w-10 mb-3" />
                <p>Selecione a Versão, Livro e Capítulo.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-0 mt-4 flex-shrink-0">
        <div className="flex items-stretch justify-center w-full gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNavigation("prev")}
            disabled={!canGoPrev || isBroadcasting}
            className="px-3 md:px-4"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">Anterior</span>
          </Button>

          <Button
            size="lg"
            onClick={() => selectedVerse && transmitVerse(selectedVerse)}
            disabled={!selectedVerse || isBroadcasting}
            className="w-full flex-grow bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isBroadcasting && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            {selectedVerse ? "Transmitir Versículo" : "Selecione um Versículo"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNavigation("next")}
            disabled={!canGoNext || isBroadcasting}
            className="px-3 md:px-4"
          >
            <span className="mr-2 hidden md:inline">Próximo</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
