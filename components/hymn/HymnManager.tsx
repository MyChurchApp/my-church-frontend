"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Loader2,
  Music,
  Search,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import {
  hymnService,
  type Hymn,
  type HymnSummary,
  type HymnVerse,
} from "@/services/worship/worship";
import { worshipService } from "@/services/worship/worship";

// Define um tipo para as partes do hino
type HymnPart = {
  type: "verse" | "chorus";
  apiNumber: number; // 0 para coro, 1, 2, 3... para versos
  text: string;
};

// Subcomponente para renderizar os detalhes de um hino
function HymnDetails({
  hymn,
  displaySequence,
  currentSequenceIndex,
}: {
  hymn: Hymn;
  displaySequence: HymnPart[];
  currentSequenceIndex: number;
}) {
  const formatText = (text: string | null) => {
    if (!text) return null;
    return text.split("<br>").map((line, index) => (
      <React.Fragment key={index}>
        {line.trim()}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-xl">{hymn.title}</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {displaySequence.map((part, index) => {
            const isPresented = currentSequenceIndex === index;
            const isChorus = part.type === "chorus";

            return (
              <div
                key={`${part.type}-${part.apiNumber}-${index}`}
                className={`p-3 rounded-md transition-colors ${
                  isPresented ? "bg-blue-50 ring-2 ring-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`font-semibold ${isChorus ? "italic" : ""}`}>
                    {isChorus ? "Coro" : `Verso ${part.apiNumber}`}
                  </h4>
                </div>
                <p className="text-gray-700">{formatText(part.text)}</p>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// Componente Principal do Gerenciador de Hinos
export function HymnManager({ worshipId }: { worshipId: number }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHymnNumber, setSelectedHymnNumber] = useState<number | null>(
    null
  );
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(-1);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { data: allHymns = [], isLoading: isLoadingSummaries } = useQuery<
    HymnSummary[]
  >({
    queryKey: ["hymn-summaries"],
    queryFn: hymnService.getSummaries,
  });

  const { data: selectedHymn, isLoading: isLoadingDetails } =
    useQuery<Hymn | null>({
      queryKey: ["hymn-details", selectedHymnNumber],
      queryFn: () =>
        selectedHymnNumber ? hymnService.getHymn(selectedHymnNumber) : null,
      enabled: !!selectedHymnNumber,
      staleTime: 1000 * 60 * 5,
      onSuccess: () => {
        setCurrentSequenceIndex(-1); // Reseta o índice ao trocar de hino
      },
    });

  const { mutate: presentPart, isPending: isPresenting } = useMutation({
    mutationFn: (params: { partApiNumber: number; index: number }) => {
      if (!selectedHymnNumber) throw new Error("Nenhum hino selecionado");
      return worshipService.presentHymn(
        worshipId,
        selectedHymnNumber,
        params.partApiNumber
      );
    },
    onSuccess: (_, params) => {
      console.log(
        `Parte com índice ${params.index} (API Num: ${params.partApiNumber}) transmitida!`
      );
      setCurrentSequenceIndex(params.index);
    },
    onError: (err: any) => {
      alert(`Erro ao transmitir parte do hino: ${err.message}`);
    },
  });

  const displaySequence = useMemo((): HymnPart[] => {
    if (!selectedHymn) return [];
    const sequence: HymnPart[] = [];
    selectedHymn.verses.forEach((verse) => {
      sequence.push({
        type: "verse",
        apiNumber: verse.number,
        text: verse.text,
      });
      if (selectedHymn.chorus) {
        sequence.push({
          type: "chorus",
          apiNumber: 0,
          text: selectedHymn.chorus,
        });
      }
    });
    return sequence;
  }, [selectedHymn]);

  const handleNavigation = (direction: "next" | "prev") => {
    if (displaySequence.length === 0) return;
    const nextIndex =
      direction === "next"
        ? currentSequenceIndex + 1
        : currentSequenceIndex - 1;
    if (nextIndex >= 0 && nextIndex < displaySequence.length) {
      const nextPart = displaySequence[nextIndex];
      presentPart({ partApiNumber: nextPart.apiNumber, index: nextIndex });
    }
  };

  const handlePresentFirstVerse = () => {
    if (displaySequence.length > 0) {
      const firstVerse = displaySequence[0];
      presentPart({ partApiNumber: firstVerse.apiNumber, index: 0 });
    }
  };

  const filteredHymns = useMemo(() => {
    if (!searchTerm) return allHymns;
    return allHymns.filter((hymn) =>
      hymn.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allHymns]);

  const canGoPrev = currentSequenceIndex > 0;
  const canGoNext = currentSequenceIndex < displaySequence.length - 1;

  const HymnDetailsSection = () => (
    <>
      {isLoadingDetails && (
        <div className="flex items-center justify-center h-full py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}
      {!isLoadingDetails && selectedHymn && (
        <div className="flex flex-col h-full">
          <HymnDetails
            hymn={selectedHymn}
            displaySequence={displaySequence}
            currentSequenceIndex={currentSequenceIndex}
          />
          <div className="p-4 border-t space-y-2">
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleNavigation("prev")}
                disabled={!canGoPrev || isPresenting}
              >
                <ChevronLeft className="h-5 w-5" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleNavigation("next")}
                disabled={!canGoNext || isPresenting}
              >
                Próximo <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button
              className="w-full"
              onClick={handlePresentFirstVerse}
              disabled={isPresenting || displaySequence.length === 0}
            >
              {isPresenting && currentSequenceIndex === 0 ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Transmitir Hino (Verso 1)
            </Button>
          </div>
        </div>
      )}
      {!isLoadingDetails && !selectedHymn && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
          <Music className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">Selecione um hino</p>
        </div>
      )}
    </>
  );

  return (
    <Card>
      {/* Layout para Mobile */}
      <div className="block md:hidden">
        <CardHeader>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                <span className="truncate">
                  {selectedHymnNumber
                    ? allHymns.find((h) => h.number === selectedHymnNumber)
                        ?.title
                    : "Selecione um hino..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput
                  placeholder="Buscar hino..."
                  onValueChange={setSearchTerm}
                />
                <CommandEmpty>Nenhum hino encontrado.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {isLoadingSummaries ? (
                      <div className="p-4 text-center">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </div>
                    ) : (
                      filteredHymns.map((hymn) => (
                        <CommandItem
                          key={hymn.number}
                          value={hymn.title}
                          onSelect={() => {
                            setSelectedHymnNumber(hymn.number);
                            setPopoverOpen(false);
                          }}
                        >
                          {hymn.title}
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
          <HymnDetailsSection />
        </CardContent>
      </div>

      {/* Layout para Desktop */}
      <CardContent className="hidden md:grid p-0 md:grid-cols-3 min-h-[60vh]">
        <div className="col-span-1 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por número ou título..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-grow h-[50vh]">
            {isLoadingSummaries ? (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredHymns.map((hymn) => (
                  <Button
                    key={hymn.number}
                    variant={
                      selectedHymnNumber === hymn.number ? "secondary" : "ghost"
                    }
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setSelectedHymnNumber(hymn.number)}
                  >
                    {hymn.title}
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <div className="md:col-span-2 flex flex-col">
          <HymnDetailsSection />
        </div>
      </CardContent>
    </Card>
  );
}
