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
import { ChevronRight, X, Sun, Moon, Book } from "lucide-react";
import { Label } from "@/components/ui/label";

// AQUI ESTÁ A CORREÇÃO: Adicionamos as novas props à interface
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
  currentTheme: "light" | "dark" | "sepia";
  onThemeChange: (theme: "light" | "dark" | "sepia") => void;
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
  currentTheme,
  onThemeChange,
}: NavigationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md" onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>Navegação e Opções</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Navegação */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Versão</Label>
              <Select
                value={currentVersionId?.toString() || ""}
                onValueChange={(v) => onVersionChange(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
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
            <div>
              <Label className="text-sm font-medium">Livro</Label>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={onBookSelectClick}
              >
                <span>{currentBook?.name || "Selecione..."}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Label className="text-sm font-medium">Capítulo</Label>
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

          {/* Seletor de Tema */}
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium">Aparência da Leitura</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                variant={currentTheme === "light" ? "secondary" : "outline"}
                onClick={() => onThemeChange("light")}
                className="h-16 flex-col gap-1"
              >
                <Sun className="h-5 w-5" /> Claro
              </Button>
              <Button
                variant={currentTheme === "sepia" ? "secondary" : "outline"}
                onClick={() => onThemeChange("sepia")}
                className="h-16 flex-col gap-1"
              >
                <Book className="h-5 w-5" /> Sépia
              </Button>
              <Button
                variant={currentTheme === "dark" ? "secondary" : "outline"}
                onClick={() => onThemeChange("dark")}
                className="h-16 flex-col gap-1"
              >
                <Moon className="h-5 w-5" /> Escuro
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
