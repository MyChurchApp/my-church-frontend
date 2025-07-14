"use client";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Loader2, X } from "lucide-react";

interface ChapterModalProps {
  open: boolean;
  onClose: () => void;
  chapters: { id: number; chapterNumber: number }[];
  currentChapter: number;
  onSelectChapter: (chapterNumber: number) => void;
  isLoading: boolean;
  bookName?: string | undefined;
}

export function ChapterModal({
  open,
  onClose,
  chapters,
  currentChapter,
  onSelectChapter,
  isLoading,
  bookName,
}: ChapterModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && document.body) {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      if (typeof window !== "undefined" && document.body) {
        document.body.style.overflow = "";
      }
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  // Scroll to the current chapter when the modal opens
  useEffect(() => {
    if (open && modalRef.current) {
      const selectedChapterElement = modalRef.current.querySelector(
        `[data-chapter="${currentChapter}"]`
      ) as HTMLElement;
      if (selectedChapterElement) {
        selectedChapterElement.scrollIntoView({
          behavior: "instant",
          block: "center",
        });
      }
    }
  }, [open, chapters, currentChapter]);

  if (!open) return null;

  if (typeof window === "undefined" || !document.body) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 z-50 border border-gray-200 dark:border-gray-700
                   w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl
                   max-h-[85vh] overflow-y-auto custom-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
          aria-label="Fechar"
          title="Fechar seleção de capítulo"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl sm:text-2xl font-extrabold mb-4 text-blue-700 dark:text-blue-400 text-center">
          Capítulos de {bookName || "Livro"}
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-blue-600 dark:text-blue-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-md font-medium">Carregando capítulos...</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            <p className="text-md font-medium">Nenhum capítulo disponível.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3">
            {chapters.map((chap) => (
              <button
                key={chap.id}
                data-chapter={chap.chapterNumber}
                onClick={() => {
                  onSelectChapter(chap.chapterNumber);
                  onClose();
                }}
                className={`flex items-center justify-center w-full aspect-square p-4 rounded-lg text-xl font-semibold
                  ${
                    chap.chapterNumber === currentChapter
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-600"
                  }
                  transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {chap.chapterNumber}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
