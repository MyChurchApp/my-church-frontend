"use client";

import React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Sparkles } from "lucide-react";

export interface GeminiModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    explanation: string;
    context: string;
    application: string;
  } | null;
  isLoading: boolean;
}

export function GeminiModal({
  open,
  onClose,
  data,
  isLoading,
}: GeminiModalProps) {
  if (!open) return null;

  if (typeof window === "undefined" || !document.body) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm md:max-w-lg lg:max-w-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>

            <h2 className="flex items-center gap-2 text-2xl font-extrabold mb-6 text-blue-700 dark:text-blue-400">
              <Sparkles size={28} className="text-yellow-500" />
              Explicação do Versículo
            </h2>

            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-10 w-10 animate-spin mb-4" />
                  <p className="text-lg font-medium">Gerando explicação...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Isso pode levar alguns segundos.
                  </p>
                </div>
              ) : !data ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                  <p className="text-lg font-medium mb-2">
                    Nenhuma explicação disponível.
                  </p>
                  <p className="text-sm">Por favor, tente novamente.</p>
                </div>
              ) : (
                <>
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="block font-semibold mb-2 text-gray-800 dark:text-gray-200 text-lg">
                      Explicação:
                    </span>
                    <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {data.explanation}
                    </p>
                  </div>

                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="block font-semibold mb-2 text-gray-800 dark:text-gray-200 text-lg">
                      Contexto:
                    </span>
                    <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {data.context}
                    </p>
                  </div>

                  <div>
                    <span className="block font-semibold mb-2 text-gray-800 dark:text-gray-200 text-lg">
                      Aplicação:
                    </span>
                    <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {data.application}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
