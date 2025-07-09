"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Loader2, Music, ChevronLeft, ChevronRight, Send } from "lucide-react";
import {
  hymnService,
  worshipService,
  type Hymn,
  type HymnSummary,
} from "@/services/worship/worship";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

type HymnPart = {
  type: "verse" | "chorus";
  label: string;
  apiNumber: number;
  text: string;
};

// Componente de Detalhes do Hino (sem alterações na sua lógica interna)
function HymnDetailsSection({
  selectedHymn,
  isLoadingDetails,
  displaySequence,
  currentSequenceIndex,
  focusedRef,
  handleNavigation,
  handlePresentFirstVerse,
  canGoPrev,
  canGoNext,
  isPresenting,
}: {
  selectedHymn: Hymn | null;
  isLoadingDetails: boolean;
  displaySequence: HymnPart[];
  currentSequenceIndex: number;
  focusedRef: React.RefObject<HTMLDivElement>;
  handleNavigation: (direction: "next" | "prev") => void;
  handlePresentFirstVerse: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  isPresenting: boolean;
}) {
  const formatText = (text: string | null) => {
    if (!text) return null;
    return text
      .split("<br>")
      .map((line, index) => <p key={index}>{line.trim()}</p>);
  };

  if (isLoadingDetails) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }
  if (!selectedHymn) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <Music className="mb-4 h-16 w-16" />
        <p className="text-lg">Selecione um hino para começar</p>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent flex flex-col h-full p-0">
      <CardHeader className="px-1 flex-shrink-0">
        <CardTitle>{selectedHymn.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0  flex-grow overflow-hidden">
        <ScrollArea className="h-[30vh] pr-4">
          <div className="space-y-2">
            {displaySequence.map((part, index) => {
              const isPresented = currentSequenceIndex === index;
              return (
                <div
                  ref={isPresented ? focusedRef : undefined}
                  key={`${part.type}-${part.apiNumber}-${index}`}
                  className={cn(
                    "rounded-lg border bg-white dark:bg-gray-900/50 p-4  transition-all duration-300",
                    isPresented
                      ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                >
                  <span
                    className={cn(
                      "mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      part.type === "chorus"
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                    )}
                  >
                    {part.label}
                  </span>
                  <div className="text-xs text-gray-700 dark:text-gray-300 w-full">
                    {formatText(part.text)}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-0 pt-4 flex-shrink-0">
        <div className="flex items-stretch justify-center w-full gap-2">
          {/* Botão Anterior */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNavigation("prev")}
            disabled={!canGoPrev || isPresenting}
            className="px-3 md:px-4"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">Anterior</span>
          </Button>

          {/* Botão Principal (maior) */}
          <Button
            size="lg"
            onClick={handlePresentFirstVerse}
            disabled={isPresenting || displaySequence.length === 0}
            className="w-full flex-grow bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPresenting && currentSequenceIndex === -1 ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {/* Esconde o texto em telas pequenas para dar mais espaço */}
            <span className="hidden sm:inline">Apresentar do Início</span>
          </Button>

          {/* Botão Próximo */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNavigation("next")}
            disabled={!canGoNext || isPresenting}
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

// Componente Principal
export function HymnManager({ worshipId }: { worshipId: number }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHymnNumber, setSelectedHymnNumber] = useState<number | null>(
    null
  );
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(-1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const focusedRef = useRef<HTMLDivElement | null>(null);

  const { data: allHymns = [] } = useQuery<HymnSummary[]>({
    queryKey: ["hymn-summaries"],
    queryFn: hymnService.getSummaries,
  });

  const { data: selectedHymn, isLoading: isLoadingDetails } =
    useQuery<Hymn | null>({
      queryKey: ["hymn-details", selectedHymnNumber],
      queryFn: () =>
        selectedHymnNumber ? hymnService.getHymn(selectedHymnNumber) : null,
      enabled: !!selectedHymnNumber,
    });

  const { mutate: presentPart, isPending: isPresenting } = useMutation({
    mutationFn: (variables: { partApiNumber: number }) => {
      if (!selectedHymn) throw new Error("Hino não selecionado");
      return worshipService.presentHymn(worshipId, {
        hymnNumber: selectedHymn.number,
        verseNumber: variables.partApiNumber,
      });
    },
    onError: (err: any) => alert(`Erro ao apresentar: ${err.message}`),
  });

  const displaySequence = useMemo((): HymnPart[] => {
    if (!selectedHymn) return [];
    const sequence: HymnPart[] = [];
    selectedHymn.verses.forEach((verse) => {
      sequence.push({
        type: "verse",
        label: `Verso ${verse.number}`,
        apiNumber: verse.number,
        text: verse.text,
      });
      if (selectedHymn.chorus) {
        sequence.push({
          type: "chorus",
          label: "Coro",
          apiNumber: 0,
          text: selectedHymn.chorus,
        });
      }
    });
    return sequence;
  }, [selectedHymn]);

  useEffect(() => {
    if (focusedRef.current) {
      focusedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentSequenceIndex]);

  const handleNavigation = useCallback(
    (direction: "next" | "prev") => {
      setCurrentSequenceIndex((prevIndex) => {
        const nextIndex = direction === "next" ? prevIndex + 1 : prevIndex - 1;
        if (nextIndex >= 0 && nextIndex < displaySequence.length) {
          const nextPart = displaySequence[nextIndex];
          presentPart({ partApiNumber: nextPart.apiNumber });
          return nextIndex;
        }
        return prevIndex;
      });
    },
    [displaySequence, presentPart]
  );

  const handlePresentFirstVerse = useCallback(() => {
    if (displaySequence.length > 0) {
      const firstPart = displaySequence[0];
      setCurrentSequenceIndex(0);
      presentPart({ partApiNumber: firstPart.apiNumber });
    }
  }, [displaySequence, presentPart]);

  const handleHymnSelection = (hymnNumber: number) => {
    setSelectedHymnNumber(hymnNumber);
    setCurrentSequenceIndex(-1);
    setIsDrawerOpen(false);
  };

  const filteredHymns = useMemo(() => {
    if (!searchTerm) return allHymns;
    return allHymns.filter((hymn) =>
      hymn.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allHymns]);

  const canGoPrev = currentSequenceIndex > 0;
  const canGoNext = currentSequenceIndex < displaySequence.length - 1;

  return (
    // ✅ O layout principal agora é uma única coluna
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b dark:border-gray-700">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
            >
              <Music className="mr-2 h-4 w-4" />
              <span className="truncate flex-grow">
                {selectedHymn?.title ?? "Selecionar um hino..."}
              </span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-md">
              <DrawerHeader>
                <DrawerTitle>Buscar Hino</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 pb-0">
                <Input
                  placeholder="Digite para buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <ScrollArea className="h-[60vh]">
                <div className="p-4 space-y-1">
                  {filteredHymns.length > 0 ? (
                    filteredHymns.map((hymn) => (
                      <Button
                        key={hymn.number}
                        variant="ghost"
                        onClick={() => handleHymnSelection(hymn.number)}
                        className="w-full justify-start text-left h-auto py-3"
                      >
                        <span className="w-8 font-mono text-xs text-gray-500 mr-2">
                          {hymn.number}.
                        </span>
                        <span>{hymn.title}</span>
                      </Button>
                    ))
                  ) : (
                    <p className="p-4 text-center text-sm text-gray-500">
                      Nenhum hino encontrado.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="flex-grow p-4 overflow-hidden">
        <HymnDetailsSection
          selectedHymn={selectedHymn}
          isLoadingDetails={isLoadingDetails}
          displaySequence={displaySequence}
          currentSequenceIndex={currentSequenceIndex}
          focusedRef={focusedRef}
          handleNavigation={handleNavigation}
          handlePresentFirstVerse={handlePresentFirstVerse}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          isPresenting={isPresenting}
        />
      </div>
    </div>
  );
}
