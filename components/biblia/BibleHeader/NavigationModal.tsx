"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BibleVersion, BibleBook } from "@/services/biblia/biblia";
import { ChevronRight, X } from "lucide-react";

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: BibleVersion[];
  currentVersionId?: number;
  onVersionChange: (id: number) => void;
  currentBook?: BibleBook;
  onBookSelectClick: () => void;
  currentChapter: number;
  onChapterSelectClick: () => void;
}

export function NavigationModal({
  isOpen,
  onClose,
  versions,
  currentVersionId,
  onVersionChange,
  currentBook,
  onBookSelectClick,
  currentChapter,
  onChapterSelectClick,
}: NavigationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md" onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>Navegar pela Bíblia</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Seletor de Versão */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Versão
            </label>
            <Select
              value={currentVersionId?.toString() || ""}
              onValueChange={(v) => onVersionChange(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a versão..." />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Livro */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Livro
            </label>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={onBookSelectClick}
            >
              <span>{currentBook?.name || "Selecione o livro..."}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Seletor de Capítulo */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Capítulo
            </label>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={onChapterSelectClick}
            >
              <span>Capítulo {currentChapter}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
