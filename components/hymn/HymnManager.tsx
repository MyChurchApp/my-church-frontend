"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Music, Search, Send } from "lucide-react";
import {
  hymnService,
  type Hymn,
  type HymnSummary,
} from "@/services/worship/worship"; // Usando o mesmo arquivo de serviço por enquanto
import { worshipService } from "@/services/worship/worship";

// Subcomponente para renderizar os detalhes de um hino
function HymnDetails({
  hymn,
  onPresent,
  isPresenting,
}: {
  hymn: Hymn;
  onPresent: () => void;
  isPresenting: boolean;
}) {
  // Função para tratar quebras de linha <br> no texto
  const formatText = (text: string) => {
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
        {hymn.chorus && (
          <div className="mb-4 italic bg-yellow-50 p-3 rounded-md">
            <h4 className="font-semibold mb-1 not-italic">Coro</h4>
            <p className="text-gray-700">{formatText(hymn.chorus)}</p>
          </div>
        )}
        <div className="space-y-4">
          {hymn.verses.map((verse) => (
            <div key={verse.number}>
              <h4 className="font-semibold mb-1">Verso {verse.number}</h4>
              <p className="text-gray-700">{formatText(verse.text)}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t mt-auto">
        <Button className="w-full" onClick={onPresent} disabled={isPresenting}>
          {isPresenting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Transmitir Hino
        </Button>
      </div>
    </div>
  );
}

// Componente Principal do Gerenciador de Hinos
export function HymnManager({ worshipId }: { worshipId: number }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHymnNumber, setSelectedHymnNumber] = useState<number | null>(
    null
  );

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
      staleTime: 1000 * 60 * 5, // Cache de 5 minutos para os detalhes do hino
    });

  const { mutate: presentHymn, isPending: isPresenting } = useMutation({
    mutationFn: () => {
      if (!selectedHymnNumber) throw new Error("Nenhum hino selecionado");
      return worshipService.presentHymn(worshipId, selectedHymnNumber);
    },
    onSuccess: () => {
      console.log("Hino transmitido com sucesso!");
    },
    onError: (err: any) => {
      alert(`Erro ao transmitir hino: ${err.message}`);
    },
  });

  const filteredHymns = useMemo(() => {
    if (!searchTerm) return allHymns;
    return allHymns.filter((hymn) =>
      hymn.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allHymns]);

  return (
    <Card>
      <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 min-h-[60vh]">
        {/* Coluna da Esquerda: Pesquisa e Lista */}
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
          <ScrollArea className="flex-grow">
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

        {/* Coluna da Direita: Detalhes do Hino */}
        <div className="md:col-span-2">
          {isLoadingDetails && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          {!isLoadingDetails && selectedHymn && (
            <HymnDetails
              hymn={selectedHymn}
              onPresent={() => presentHymn()}
              isPresenting={isPresenting}
            />
          )}
          {!isLoadingDetails && !selectedHymn && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
              <Music className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">Selecione um hino da lista</p>
              <p className="text-sm">Os detalhes aparecerão aqui.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
