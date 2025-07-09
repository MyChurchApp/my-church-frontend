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
  worshipService,
  type Hymn,
  type HymnSummary,
} from "@/services/worship/worship";

type HymnPart = {
  type: "verse" | "chorus";
  label: string;
  apiNumber: number;
  text: string;
};

type HymnDetailsSectionProps = {
  isLoadingDetails: boolean;
  selectedHymn: Hymn | null;
  displaySequence: HymnPart[];
  currentSequenceIndex: number;
  focusedRef: any;
  handleNavigation: (direction: "next" | "prev") => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  isPresenting: boolean;
  handlePresentFirstVerse: () => void;
};

const buttonClasses = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  outline:
    "bg-white border border-gray-300 hover:bg-gray-100 focus-visible:ring-gray-400",
  ghost: "bg-transparent hover:bg-gray-100",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  lg: "h-11 rounded-md px-8",
};

const formatText = (text: string | null) => {
  if (!text) return null;
  return text
    .split("<br>")
    .map((line, index) => <p key={index}>{line.trim()}</p>);
};

function HymnDetailsSection({
  isLoadingDetails,
  selectedHymn,
  displaySequence,
  currentSequenceIndex,
  focusedRef,
  handleNavigation,
  canGoPrev,
  canGoNext,
  isPresenting,
  handlePresentFirstVerse,
}: HymnDetailsSectionProps) {
  if (isLoadingDetails) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }
  if (!selectedHymn) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <Music className="mb-4 h-16 w-16" />
        <p className="text-lg">Selecione um hino da lista</p>
      </div>
    );
  }
  const currentPart = displaySequence[currentSequenceIndex];
  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <div className="flex-shrink-0 border-b bg-white p-4">
        <h3 className="text-xl font-bold tracking-tight">
          {selectedHymn.title}
        </h3>
      </div>
      <div className="h-0 flex-grow overflow-y-auto p-4">
        <div className="space-y-4">
          {displaySequence.map((part, index) => {
            const isPresented = currentSequenceIndex === index;
            return (
              <div
                ref={isPresented ? focusedRef : undefined}
                key={`${part.type}-${part.apiNumber}-${index}`}
                data-part-index={index}
                className={cn(
                  "rounded-lg border bg-white p-4 transition-all duration-300",
                  isPresented
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                    : "border-gray-200"
                )}
              >
                <span
                  className={cn(
                    "mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    part.type === "chorus"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                  )}
                >
                  {part.label}
                </span>
                <div className="space-y-2 leading-relaxed text-gray-700">
                  {formatText(part.text)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-shrink-0 space-y-3 border-t bg-white/80 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => handleNavigation("prev")}
            disabled={!canGoPrev || isPresenting}
            className={cn(buttonClasses.base, buttonClasses.outline, "flex-1")}
          >
            <ChevronLeft className="mr-1 h-5 w-5" /> Anterior
          </button>
          <div className="text-center text-sm font-medium text-gray-600">
            {currentPart ? (
              <>
                <span className="font-bold">{currentPart.label}</span>
                <span className="text-gray-400">
                  {" "}
                  / {displaySequence.length}
                </span>
              </>
            ) : (
              "Aguardando"
            )}
          </div>
          <button
            onClick={() => handleNavigation("next")}
            disabled={!canGoNext || isPresenting}
            className={cn(buttonClasses.base, buttonClasses.outline, "flex-1")}
          >
            Próximo <ChevronRight className="ml-1 h-5 w-5" />
          </button>
        </div>
        <button
          onClick={handlePresentFirstVerse}
          disabled={isPresenting || displaySequence.length === 0}
          className={cn(
            buttonClasses.base,
            buttonClasses.primary,
            buttonClasses.lg,
            "w-full font-semibold"
          )}
        >
          <Send className="mr-2 h-4 w-4" /> Apresentar do Início
        </button>
      </div>
    </div>
  );
}

export function HymnManager({ worshipId }: { worshipId: number }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHymnNumber, setSelectedHymnNumber] = useState<number | null>(
    null
  );
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(-1);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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
    onError: (err: Error) => {
      alert(
        `Ocorreu um erro ao enviar o comando para a apresentação: ${err.message}`
      );
    },
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

  const focusedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (focusedRef.current) {
      focusedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentSequenceIndex]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverRef]);

  const handleNavigation = useCallback(
    (direction: "next" | "prev") => {
      const nextIndex =
        direction === "next"
          ? currentSequenceIndex + 1
          : currentSequenceIndex - 1;
      if (nextIndex >= 0 && nextIndex < displaySequence.length) {
        const nextPart = displaySequence[nextIndex];
        setCurrentSequenceIndex(nextIndex);
        presentPart({ partApiNumber: nextPart.apiNumber });
      }
    },
    [currentSequenceIndex, displaySequence, presentPart]
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
    <div className="overflow-hidden rounded-lg border bg-white flex flex-col md:flex-row h-[80vh]">
      <div className="w-full md:w-1/3 xl:w-1/4 flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r">
        <div className="flex-shrink-0 border-b p-4 md:border-b-0 md:border-b-transparent">
          <div className="relative" ref={popoverRef}>
            <div className="block md:hidden">
              <button
                type="button"
                onClick={() => setPopoverOpen(!popoverOpen)}
                className={cn(
                  buttonClasses.base,
                  buttonClasses.outline,
                  "w-full justify-between"
                )}
              >
                <span className="truncate">
                  {selectedHymn?.title ?? "Selecione um hino..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
              {popoverOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                  <div className="p-2">
                    <input
                      placeholder="Buscar hino..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredHymns.length === 0 ? (
                      <p className="p-4 text-center text-sm text-gray-500">
                        Nenhum hino encontrado.
                      </p>
                    ) : (
                      filteredHymns.map((hymn) => (
                        <button
                          key={hymn.number}
                          onClick={() => {
                            handleHymnSelection(hymn.number);
                            setPopoverOpen(false);
                          }}
                          className={cn(
                            buttonClasses.base,
                            buttonClasses.ghost,
                            "w-full justify-start text-left"
                          )}
                        >
                          {hymn.title}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Buscar hino..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto hidden md:block">
          <div className="space-y-1 p-2">
            {filteredHymns.map((hymn) => (
              <button
                key={hymn.number}
                onClick={() => handleHymnSelection(hymn.number)}
                className={cn(
                  buttonClasses.base,
                  selectedHymnNumber === hymn.number
                    ? buttonClasses.secondary
                    : buttonClasses.ghost,
                  "h-auto w-full justify-start px-3 py-2 text-left"
                )}
              >
                <span className="w-8 font-mono text-xs text-gray-500">
                  {hymn.number}.
                </span>
                <span>{hymn.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-grow h-[calc(100vh-160px)] md:h-auto">
        <HymnDetailsSection
          isLoadingDetails={isLoadingDetails}
          selectedHymn={selectedHymn || null}
          displaySequence={displaySequence}
          currentSequenceIndex={currentSequenceIndex}
          focusedRef={focusedRef}
          handleNavigation={handleNavigation}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          isPresenting={isPresenting}
          handlePresentFirstVerse={handlePresentFirstVerse}
        />
      </div>
    </div>
  );
}
