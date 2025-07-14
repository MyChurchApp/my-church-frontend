"use client";

import { BibleBook, BibleVerse } from "@/services/biblia/biblia";
import { Loader2 } from "lucide-react";

interface BibleContentProps {
  book?: BibleBook;
  chapter: number;
  verses: BibleVerse[];
  isLoading: boolean;
  onVerseClick: (
    event: React.MouseEvent<HTMLParagraphElement>,
    verse: BibleVerse
  ) => void;
}

export function BibleContent({
  book,
  chapter,
  verses,
  isLoading,
  onVerseClick,
}: BibleContentProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-blue-600 dark:text-blue-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg font-medium">Carregando versículos...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        {book?.name} {chapter}
      </h2>
      <article className="prose prose-lg dark:prose-invert max-w-none">
        {verses.map((v) => (
          <p
            key={v.id}
            className="mb-4 cursor-pointer p-2 rounded-md transition-colors hover:bg-blue-100/50 dark:hover:bg-blue-900/40"
            onClick={(e) => onVerseClick(e, v)}
          >
            <sup className="font-bold text-blue-700 dark:text-blue-400 mr-2">
              {v.verseNumber}
            </sup>
            {v.text}
          </p>
        ))}
      </article>
    </div>
  );
}
