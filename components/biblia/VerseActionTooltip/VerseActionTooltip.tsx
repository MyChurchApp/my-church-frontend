"use client";

import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { TooltipState } from "@/services/biblia/biblia";
import { Copy, Share2, Bot, X, Loader2 } from "lucide-react";

interface VerseActionTooltipProps {
  tooltip: TooltipState | null;
  onClose: () => void;
  onCopy: () => void;
  onShare: () => void;
  onExplain: () => void;
  isGeminiLoading: boolean;
  showExplainButton?: boolean;
}

export function VerseActionTooltip({
  tooltip,
  onClose,
  onCopy,
  onShare,
  onExplain,
  isGeminiLoading,
  showExplainButton = false,
}: VerseActionTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (tooltip) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tooltip, onClose]);

  if (!tooltip) return null;

  return ReactDOM.createPortal(
    <div
      ref={tooltipRef}
      className="absolute z-50 flex flex-col items-center"
      style={{ top: tooltip.y, left: tooltip.x, transform: "translateX(-50%)" }}
    >
      <div className="bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow-xl p-2 flex flex-col gap-2 border border-gray-700">
        <div className="flex justify-between items-center pb-1 border-b border-gray-600">
          <span className="font-semibold text-sm">
            {tooltip.verseReference}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex justify-around gap-2">
          <button
            onClick={onCopy}
            className="flex flex-col items-center p-2 rounded-md hover:bg-gray-600 flex-1"
          >
            <Copy size={20} /> <span className="text-xs">Copiar</span>
          </button>
          <button
            onClick={onShare}
            className="flex flex-col items-center p-2 rounded-md hover:bg-gray-600 flex-1"
          >
            <Share2 size={20} /> <span className="text-xs">Partilhar</span>
          </button>
          {showExplainButton && (
            <button
              onClick={onExplain}
              disabled={isGeminiLoading}
              className="..."
            >
              {isGeminiLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Bot size={20} />
              )}
              <span className="text-xs">Explicar</span>
            </button>
          )}
        </div>
      </div>
      <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-gray-800 -mt-1"></div>
    </div>,
    document.body
  );
}
