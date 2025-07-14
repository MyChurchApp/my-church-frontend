"use client";

import { BibleBook, BibleVerse } from "@/services/biblia/biblia";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface BibleContentProps {
  book?: BibleBook;
  chapter: number;
  verses: BibleVerse[];
  isLoading: boolean;
  onVerseClick: (
    event: React.MouseEvent<HTMLParagraphElement>,
    verse: BibleVerse
  ) => void;
  theme: "light" | "dark" | "sepia";
}

export function BibleContent({
  book,
  chapter,
  verses,
  isLoading,
  onVerseClick,
  theme,
}: BibleContentProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className={clsx("transition-colors duration-500", {
        "bg-[#f9f5f0] text-[#5c5245]": theme === "sepia",
        "bg-white text-gray-900": theme === "light",
        "bg-gray-900 text-gray-200": theme === "dark",
      })}
    >
      <div>
        <h2
          className={clsx("text-3xl font-bold text-center mb-8 font-serif", {
            "text-[#4d443a]": theme === "sepia",
          })}
        >
          {book?.name} {chapter}
        </h2>
        <article
          className={clsx(
            "prose-lg max-w-none text-justify font-serif leading-relaxed sm:leading-loose",
            "grid gap-x-8", // Espaço entre colunas
            "md:grid-cols-2", // 2 colunas em desktop
            "md:[column-fill:_balance]" // balancear altura das colunas (opcional, só browsers modernos)
          )}
        >
          {verses.map((v) => (
            <p
              key={v.id}
              className="mb-4 cursor-pointer p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 break-inside-avoid-column"
              onClick={(e) => onVerseClick(e, v)}
            >
              <sup
                className={clsx("font-bold mr-2 select-none", {
                  "text-[#945200]": theme === "sepia",
                  "text-primary": theme !== "sepia",
                })}
              >
                {v.verseNumber}
              </sup>
              {v.text}
            </p>
          ))}
        </article>
      </div>
    </div>
  );
}
