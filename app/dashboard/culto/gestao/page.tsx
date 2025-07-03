"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  MonitorPlay,
  Plus,
  Trash2,
  GripVertical,
  Pencil,
  Check,
  X,
  PlayCircle,
  Heart,
  XCircle,
  HandHeart,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  worshipService,
  bibleService,
  type WorshipService,
  WorshipStatus,
  type WorshipScheduleItem,
  type BibleVersion,
  type BibleBook,
  type BibleChapter,
  type BibleVerse,
  type PrayerRequest,
} from "@/services/worship/worship";
import { HymnManager } from "@/components/hymn/HymnManager";
import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";

// ===================================================================
//   1. COMPONENTE DO SELETOR BÍBLICO (Original, sem alterações)
// ===================================================================
function BibleSelectorForWorship({ worshipId }: { worshipId: number }) {
  const [selectedVersion, setSelectedVersion] = useState<BibleVersion | null>(
    null
  );
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<BibleChapter | null>(
    null
  );
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const activeVerseRef = useRef<HTMLDivElement>(null);

  const { data: versions = [] } = useQuery<BibleVersion[]>({
    queryKey: ["bible-versions"],
    queryFn: bibleService.getVersions,
  });
  const { data: books = [] } = useQuery<BibleBook[]>({
    queryKey: ["bible-books", selectedVersion?.id],
    queryFn: () => bibleService.getBooksByVersion(selectedVersion!.id),
    enabled: !!selectedVersion,
  });
  const { data: chapters = [] } = useQuery<BibleChapter[]>({
    queryKey: ["bible-chapters", selectedBook?.id],
    queryFn: () => bibleService.getChaptersByBookId(selectedBook!.id),
    enabled: !!selectedBook,
  });
  const { data: verses = [] } = useQuery<BibleVerse[]>({
    queryKey: ["bible-verses", selectedChapter?.id],
    queryFn: () => bibleService.getVersesByChapterId(selectedChapter!.id),
    enabled: !!selectedChapter,
  });

  const { mutate: highlightVerse, isPending: isBroadcasting } = useMutation({
    mutationFn: (params: {
      versionId: number;
      bookId: number;
      chapterId: number;
      verseId: number;
    }) => worshipService.highlightBibleReading(worshipId, params),
    onError: (err: any) => alert(`Erro ao transmitir: ${err.message}`),
  });

  useEffect(() => {
    activeVerseRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [selectedVerse]);

  const transmitVerse = (verse: BibleVerse) => {
    if (!selectedVersion || !selectedBook || !selectedChapter) return;
    highlightVerse({
      versionId: selectedVersion.id,
      bookId: selectedBook.id,
      chapterId: selectedChapter.id,
      verseId: verse.id,
    });
  };

  const handleBroadcast = () => {
    if (!selectedVerse) return alert("Selecione um Versículo da lista.");
    transmitVerse(selectedVerse);
  };

  const handleNavigation = (direction: "next" | "prev") => {
    if (!selectedVerse || verses.length === 0) {
      if (verses.length > 0) {
        const firstVerse = verses[0];
        setSelectedVerse(firstVerse);
        transmitVerse(firstVerse);
      }
      return;
    }
    const currentIndex = verses.findIndex((v) => v.id === selectedVerse.id);
    let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= verses.length) return;
    const newSelectedVerse = verses[nextIndex];
    setSelectedVerse(newSelectedVerse);
    transmitVerse(newSelectedVerse);
  };

  const resetSelections = (level: "version" | "book" | "chapter") => {
    if (level === "version") setSelectedBook(null);
    if (level === "version" || level === "book") setSelectedChapter(null);
    setSelectedVerse(null);
  };

  const currentVerseIndex = selectedVerse
    ? verses.findIndex((v) => v.id === selectedVerse.id)
    : -1;
  const canGoPrev = currentVerseIndex > 0;
  const canGoNext =
    selectedVerse != null && currentVerseIndex < verses.length - 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          onValueChange={(v) => {
            setSelectedVersion(versions.find((ver) => ver.id === Number(v))!);
            resetSelections("version");
          }}
          value={selectedVersion?.id.toString()}
        >
          <SelectTrigger>
            <SelectValue placeholder="Versão" />
          </SelectTrigger>
          <SelectContent>
            {versions.map((v) => (
              <SelectItem key={v.id} value={String(v.id)}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) => {
            setSelectedBook(books.find((b) => b.id === Number(v))!);
            resetSelections("book");
          }}
          value={selectedBook?.id.toString()}
          disabled={!selectedVersion}
        >
          <SelectTrigger>
            <SelectValue placeholder="Livro" />
          </SelectTrigger>
          <SelectContent>
            {books.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) => {
            setSelectedChapter(chapters.find((c) => c.id === Number(v))!);
            resetSelections("chapter");
          }}
          value={selectedChapter?.id.toString()}
          disabled={!selectedBook}
        >
          <SelectTrigger>
            <SelectValue placeholder="Capítulo" />
          </SelectTrigger>
          <SelectContent>
            {chapters.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.chapterNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="border rounded-md p-2 bg-gray-50 h-64 space-y-1">
        {verses.length > 0 ? (
          verses.map((verse) => {
            const isSelected = selectedVerse?.id === verse.id;
            return (
              <div
                key={verse.id}
                ref={isSelected ? activeVerseRef : null}
                onClick={() => setSelectedVerse(verse)}
                className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${
                  isSelected
                    ? "bg-blue-100 text-blue-800 ring-2 ring-blue-300"
                    : "hover:bg-gray-200"
                }`}
              >
                <sup className="font-bold mr-2">{verse.verseNumber}</sup>
                {verse.text}
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Selecione Livro e Capítulo.</p>
          </div>
        )}
      </ScrollArea>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNavigation("prev")}
          disabled={!canGoPrev || isBroadcasting}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Anterior</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNavigation("next")}
          disabled={!canGoNext || isBroadcasting}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Próximo</span>
        </Button>
      </div>

      <Button
        className="w-full"
        onClick={handleBroadcast}
        disabled={!selectedVerse || isBroadcasting}
      >
        {isBroadcasting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Transmitir Versículo Selecionado
      </Button>
    </div>
  );
}

// ===================================================================
//   2. COMPONENTE DO GERENCIADOR DE CRONOGRAMA (Original, sem alterações)
// ===================================================================
function SortableScheduleItem({
  item,
  onRemove,
  onUpdateName,
}: {
  item: WorshipScheduleItem;
  onRemove: (id: number) => void;
  onUpdateName: (id: number, newName: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSave = () => {
    if (editedName.trim() && editedName !== item.name)
      onUpdateName(item.id, editedName.trim());
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedName(item.name);
    setIsEditing(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    else if (e.key === "Escape") handleCancel();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 pl-0 bg-gray-50 rounded-md transition-shadow ${
        isEditing ? "shadow-lg ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="flex items-center flex-grow">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab p-2 touch-none"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </button>
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-9"
          />
        ) : (
          <span className="font-medium flex-grow px-2">{item.name}</span>
        )}
      </div>
      <div className="flex items-center">
        {isEditing ? (
          <Button variant="ghost" size="icon" onClick={handleSave}>
            <Check className="h-5 w-5 text-green-600" />
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function ScheduleManager({ worshipId }: { worshipId: number }) {
  const [newItemName, setNewItemName] = useState("");
  const [scheduleItems, setScheduleItems] = useState<WorshipScheduleItem[]>([]);
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const { data: worship } = useQuery<WorshipService>({
    queryKey: ["worship-service", worshipId],
    queryFn: () => worshipService.getWorshipById(worshipId),
  });
  useEffect(() => {
    if (worship?.schedule)
      setScheduleItems(
        worship.schedule.sort((a, b) => a.order - b.order) || []
      );
  }, [worship]);

  const invalidateAndRefetch = () =>
    queryClient.invalidateQueries({ queryKey: ["worship-service", worshipId] });

  const { mutate: addItem, isPending: isAdding } = useMutation({
    mutationFn: (name: string) =>
      worshipService.addScheduleItem(worshipId, {
        name,
        order: scheduleItems.length,
      }),
    onSuccess: () => {
      setNewItemName("");
      invalidateAndRefetch();
    },
    onError: (err: any) => alert(`Erro: ${err.message}`),
  });
  const { mutate: removeItem } = useMutation({
    mutationFn: (itemId: number) =>
      worshipService.removeScheduleItem(worshipId, itemId),
    onSuccess: () => invalidateAndRefetch(),
    onError: (err: any) => alert(`Erro: ${err.message}`),
  });
  const { mutate: updateItem } = useMutation({
    mutationFn: (item: WorshipScheduleItem) =>
      worshipService.updateScheduleItem(worshipId, item.id, item),
    onSuccess: () => invalidateAndRefetch(),
    onError: (err: any) => alert(`Erro: ${err.message}`),
  });

  const handleUpdateName = (itemId: number, newName: string) => {
    const itemToUpdate = scheduleItems.find((item) => item.id === itemId);
    if (itemToUpdate) updateItem({ ...itemToUpdate, name: newName });
  };
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) addItem(newItemName.trim());
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = scheduleItems.findIndex((item) => item.id === active.id);
      const newIndex = scheduleItems.findIndex((item) => item.id === over.id);
      const newOrderItems = arrayMove(scheduleItems, oldIndex, newIndex);
      setScheduleItems(newOrderItems);
      const updatePromises = newOrderItems.map((item, index) =>
        worshipService.updateScheduleItem(worshipId, item.id, {
          ...item,
          order: index,
        })
      );
      Promise.all(updatePromises).then(() => invalidateAndRefetch());
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cronograma do Culto</CardTitle>
        <CardDescription>
          Adicione, remova, edite e reordene os itens.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={scheduleItems}
              strategy={verticalListSortingStrategy}
            >
              {scheduleItems.map((item) => (
                <SortableScheduleItem
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onUpdateName={handleUpdateName}
                />
              ))}
            </SortableContext>
          </DndContext>
          {!scheduleItems.length && (
            <p className="text-sm text-center text-gray-500 py-4">
              Nenhum item no cronograma.
            </p>
          )}
        </div>
        <form onSubmit={handleAddItem} className="flex gap-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Ex: Hino de Abertura"
            disabled={isAdding}
          />
          <Button type="submit" disabled={!newItemName.trim() || isAdding}>
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}{" "}
            Adicionar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ===================================================================
//   3. NOVO COMPONENTE PARA VISUALIZAR PEDIDOS DE ORAÇÃO (Corrigido)
// ===================================================================
function PrayerRequestViewer({ worshipId }: { worshipId: number }) {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // ✅ CORREÇÃO APLICADA AQUI
  // Busca inicial dos pedidos de oração
  const { data, isLoading, isError, error } = useQuery<PrayerRequest[]>({
    queryKey: ['prayer-requests', worshipId],
    queryFn: () => worshipService.getPrayerRequests(worshipId),
  });

  // Efeito para atualizar o estado local quando os dados da query forem carregados
  useEffect(() => {
    if (data) {
      setRequests(data);
    }
  }, [data]);


  // Efeito para ouvir novos pedidos de oração via WebSocket
  useEffect(() => {
    const handleNewRequest = (event: Event) => {
      const newRequest = (event as CustomEvent).detail as PrayerRequest;
      setRequests(prev => [newRequest, ...prev]); // Adiciona no topo
    };

    window.addEventListener('prayerRequestReceived', handleNewRequest);
    return () => {
      window.removeEventListener('prayerRequestReceived', handleNewRequest);
    };
  }, []);

  // Efeito para rolar para o topo quando um novo pedido chega
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [requests]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (isError) {
    return <div className="text-red-500 p-4">Erro ao carregar pedidos: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos de Oração</CardTitle>
        <CardDescription>
          Visualize os pedidos de oração enviados pelos membros em tempo real.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border p-4 bg-gray-50/50">
          <div ref={scrollAreaRef} className="space-y-3">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div key={req.id} className="p-3 bg-white rounded-md shadow-sm">
                  <p className="text-sm text-gray-800">{req.request}</p>
                  <p className="text-xs text-right text-gray-400 mt-2">
                    {new Date(req.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
                 <HandHeart className="h-12 w-12 mb-4" />
                 <p>Nenhum pedido de oração recebido ainda.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


// ===================================================================
//   4. COMPONENTE DO PAINEL DE CONTROLE PRINCIPAL (Com a nova funcionalidade)
// ===================================================================
function WorshipControlPanel({
  worshipId,
  onBack,
}: {
  worshipId: number;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const [currentActivityId, setCurrentActivityId] = useState<number | null>(
    null
  );
  useSignalRForWorship(worshipId);

  const [isOffering, setIsOffering] = useState(false);
  const [offeringActivityId, setOfferingActivityId] = useState<number | null>(
    null
  );

  const {
    data: worship,
    isLoading,
    isError,
  } = useQuery<WorshipService>({
    queryKey: ["worship-service", worshipId],
    queryFn: () => worshipService.getWorshipById(worshipId),
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (worship) {
      const offeringActivity = worship.activities.find(
        (activity) =>
          activity.name.toLowerCase() === "oferta" && activity.isCurrent
      );
      if (offeringActivity) {
        setIsOffering(true);
        setOfferingActivityId(offeringActivity.id);
      } else {
        setIsOffering(false);
        setOfferingActivityId(null);
      }
    }
  }, [worship]);

  const { mutate: startWorshipMutation, isPending: isStarting } = useMutation({
    mutationFn: () => worshipService.startWorship(worshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["worship-service", worshipId],
      });
      queryClient.invalidateQueries({ queryKey: ["worship-services-list"] });
    },
    onError: (err: any) => alert(`Erro: ${err.message}`),
  });

  const { mutate: presentOfferingMutation, isPending: isPresentingOffering } =
    useMutation({
      mutationFn: () => worshipService.presentOffering(worshipId),
      onSuccess: (data) => {
        setOfferingActivityId(data.id);
        setIsOffering(true);
        queryClient.invalidateQueries({
          queryKey: ["worship-service", worshipId],
        });
      },
      onError: (err: any) => alert(`Erro ao apresentar oferta: ${err.message}`),
    });

  const { mutate: finishOfferingMutation, isPending: isFinishingOffering } =
    useMutation({
      mutationFn: () => {
        if (!offeringActivityId)
          throw new Error("ID da atividade de oferta não encontrado.");
        return worshipService.finishOffering(worshipId, offeringActivityId);
      },
      onSuccess: () => {
        setIsOffering(false);
        setOfferingActivityId(null);
        queryClient.invalidateQueries({
          queryKey: ["worship-service", worshipId],
        });
      },
      onError: (err: any) => alert(`Erro ao finalizar oferta: ${err.message}`),
    });

  if (isLoading || !worship)
    return (
      <div className="p-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Erro ao carregar dados do culto.
      </div>
    );

  const isWorshipInProgress = worship.status === WorshipStatus.InProgress;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button
          onClick={() =>
            window.open(
              `/dashboard/culto/projetor?worshipId=${worshipId}`,
              "_blank"
            )
          }
        >
          <MonitorPlay className="mr-2 h-4 w-4" /> Abrir Projetor
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{worship.title}</CardTitle>
          <CardDescription>
            {worship.theme || "Sem tema definido"}
          </CardDescription>
        </CardHeader>
      </Card>

      {!isWorshipInProgress ? (
        <div className="space-y-6">
          <ScheduleManager worshipId={worship.id} />
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => startWorshipMutation()}
              disabled={isStarting}
            >
              {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Iniciar Culto
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="cronograma">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="biblia">Bíblia</TabsTrigger>
            <TabsTrigger value="hinos">Hinos</TabsTrigger>
            <TabsTrigger value="oferta">Oferta</TabsTrigger>
            <TabsTrigger value="oracoes">Orações</TabsTrigger>
            <TabsTrigger value="avisos">Avisos</TabsTrigger>
          </TabsList>

          <TabsContent value="cronograma">
            <Card>
              <CardHeader>
                <CardTitle>Andamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {worship.schedule
                  ?.sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                        item.id === currentActivityId
                          ? "bg-blue-100"
                          : "bg-gray-50"
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          item.id === currentActivityId ? "text-blue-700" : ""
                        }`}
                      >
                        {item.name}
                      </span>
                      <Button
                        size="sm"
                        variant={
                          item.id === currentActivityId ? "default" : "outline"
                        }
                        onClick={() => setCurrentActivityId(item.id)}
                      >
                        {item.id === currentActivityId ? (
                          <Badge>Em andamento</Badge>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" /> Iniciar
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="biblia">
            <Card>
              <CardContent className="p-6">
                <BibleSelectorForWorship worshipId={worshipId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hinos">
            <HymnManager worshipId={worship.id} />
          </TabsContent>

          <TabsContent value="oferta">
            <Card>
              <CardHeader>
                <CardTitle>Momento da Oferta</CardTitle>
                <CardDescription>
                  Inicie o momento da oferta para destacar o botão para os
                  membros.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 text-center space-y-4">
                {!isOffering ? (
                  <Button
                    size="lg"
                    onClick={() => presentOfferingMutation()}
                    disabled={isPresentingOffering}
                  >
                    {isPresentingOffering ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Heart className="mr-2 h-5 w-5" />
                    )}
                    Iniciar Momento da Oferta
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={() => finishOfferingMutation()}
                    disabled={isFinishingOffering}
                  >
                    {isFinishingOffering ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-5 w-5" />
                    )}
                    Finalizar Oferta
                  </Button>
                )}
                {isOffering && (
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mt-4">
                    <Check className="h-5 w-5" />
                    <span>Momento da oferta está ativo para os membros.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="oracoes">
            <PrayerRequestViewer worshipId={worshipId} />
          </TabsContent>

          <TabsContent value="avisos">
            <Card>
              <CardContent className="p-6 text-center text-gray-500 min-h-[50vh] flex items-center justify-center">
                <p>Funcionalidade de Avisos em breve...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// ===================================================================
//   5. COMPONENTE PRINCIPAL DA PÁGINA (Original, sem alterações)
// ===================================================================
export default function GestaoCultoPage() {
  const [selectedWorshipId, setSelectedWorshipId] = useState<number | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ items: WorshipService[] }>({
    queryKey: ["worship-services-list"],
    queryFn: () => worshipService.listWorshipServices({ pageSize: 100 }),
  });
  const { mutate: finishWorshipMutation, isPending: isFinishing } = useMutation(
    {
      mutationFn: (worshipId: number) =>
        worshipService.finishWorship(worshipId),
      onSuccess: (_, worshipId) => {
        queryClient.invalidateQueries({ queryKey: ["worship-services-list"] });
        queryClient.invalidateQueries({
          queryKey: ["worship-service", worshipId],
        });
        setSelectedWorshipId(null);
      },
      onError: (err: any) => alert(`Erro: ${err.message}`),
    }
  );

  if (isLoading)
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" /> Carregando...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Erro ao carregar cultos: {error.message}
      </div>
    );
  if (selectedWorshipId)
    return (
      <WorshipControlPanel
        worshipId={selectedWorshipId}
        onBack={() => setSelectedWorshipId(null)}
      />
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Culto</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.items?.map((worship) => (
          <Card key={worship.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{worship.title}</CardTitle>
                <Badge
                  variant={
                    worship.status === WorshipStatus.InProgress
                      ? "default"
                      : worship.status === WorshipStatus.Finished
                      ? "secondary"
                      : "outline"
                  }
                >
                  {worship.status === WorshipStatus.InProgress
                    ? "Em Andamento"
                    : worship.status === WorshipStatus.Finished
                    ? "Finalizado"
                    : "Não Iniciado"}
                </Badge>
              </div>
              <CardDescription>
                {worship.theme || "Sem tema definido"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground flex-grow">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />{" "}
                {new Date(worship.startTime).toLocaleDateString("pt-BR")}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />{" "}
                {new Date(worship.startTime).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </CardContent>
            <div className="p-4 pt-0 flex justify-between items-center">
              <Button onClick={() => setSelectedWorshipId(worship.id)}>
                Gerenciar
              </Button>
              {worship.status === WorshipStatus.InProgress && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isFinishing}
                  onClick={() => finishWorshipMutation(worship.id)}
                >
                  {isFinishing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Encerrar
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
