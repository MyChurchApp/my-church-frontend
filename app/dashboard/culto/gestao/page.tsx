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
  CardFooter,
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
  ListOrdered,
  BookOpen,
  Music,
  Gift,
  Bell,
  Image as ImageIcon,
  Send,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { Combobox, ComboboxOption } from "../components/combobox/combobox";

// ===================================================================
//   COMPONENTE PARA ENVIAR AVISOS (Sem alterações)
// ===================================================================
function AdminNoticeSender({ worshipId }: { worshipId: number }) {
  const [message, setMessage] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: sendNotice, isPending } = useMutation({
    mutationFn: () => {
      if (!message.trim()) throw new Error("A mensagem não pode estar vazia.");
      return worshipService.sendAdminNotice(worshipId, {
        message,
        ...(imageBase64 && { imageBase64 }),
      });
    },
    onSuccess: () => {
      setMessage("");
      setImageBase64(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (err: any) => {
      alert(`Erro ao enviar aviso: ${err.message}`);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        setImageBase64(base64String);
      };
      reader.onerror = (error) => {
        console.error("Erro ao ler o arquivo:", error);
        alert("Não foi possível carregar a imagem.");
      };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Aviso Geral</CardTitle>
        <CardDescription>
          Envie uma mensagem e uma imagem opcional para todos que estão
          acompanhando o culto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="notice-message">Mensagem</Label>
          <Textarea
            id="notice-message"
            placeholder="Digite seu aviso aqui..."
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Imagem (Opcional)</Label>
          <Input
            id="picture"
            type="file"
            accept="image/png, image/jpeg"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isPending}
          />
        </div>
        {imagePreview && (
          <div className="relative w-40 h-40 border rounded-md p-2">
            <img
              src={imagePreview}
              alt="Pré-visualização"
              className="w-full h-full object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => {
                setImagePreview(null);
                setImageBase64(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => sendNotice()}
          disabled={!message.trim() || isPending}
          className="w-full"
          size="lg"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          Enviar Aviso
        </Button>
      </CardFooter>
    </Card>
  );
}

// ===================================================================
//   COMPONENTE DO SELETOR BÍBLICO (TOTALMENTE ATUALIZADO)
// ===================================================================
function BibleSelectorForWorship({
  worshipId,
  selectedVersion,
  setSelectedVersion,
  selectedBook,
  setSelectedBook,
  selectedChapter,
  setSelectedChapter,
  selectedVerse,
  setSelectedVerse,
}: {
  worshipId: number;
  selectedVersion: BibleVersion | null;
  setSelectedVersion: React.Dispatch<React.SetStateAction<BibleVersion | null>>;
  selectedBook: BibleBook | null;
  setSelectedBook: React.Dispatch<React.SetStateAction<BibleBook | null>>;
  selectedChapter: BibleChapter | null;
  setSelectedChapter: React.Dispatch<React.SetStateAction<BibleChapter | null>>;
  selectedVerse: BibleVerse | null;
  setSelectedVerse: React.Dispatch<React.SetStateAction<BibleVerse | null>>;
}) {
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

  const versionOptions: ComboboxOption[] = versions.map((v) => ({
    value: String(v.id),
    label: v.name,
  }));
  const bookOptions: ComboboxOption[] = books.map((b) => ({
    value: String(b.id),
    label: b.name,
  }));
  const chapterOptions: ComboboxOption[] = chapters.map((c) => ({
    value: String(c.id),
    label: `Capítulo ${c.chapterNumber}`,
  }));

  const currentVerseIndex = selectedVerse
    ? verses.findIndex((v) => v.id === selectedVerse.id)
    : -1;
  const canGoPrev = currentVerseIndex > 0;
  const canGoNext =
    selectedVerse != null && currentVerseIndex < verses.length - 1;

  return (
    <div>
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row md:items-center gap-4 w-full">
          <div className="w-full md:w-1/2">
            <label htmlFor="bible-version" className="sr-only">
              Versão da Bíblia
            </label>
            <Combobox
              options={versionOptions}
              value={selectedVersion?.id.toString()}
              onValueChange={(value) => {
                setSelectedVersion(
                  versions.find((v) => v.id === Number(value)) ?? null
                );
                resetSelections("version");
              }}
              placeholder="Versão"
              searchPlaceholder="Pesquisar versão..."
              emptyPlaceholder="Nenhuma versão encontrada."
            />
          </div>
          <div className="w-full md:w-[25%] ">
            <label htmlFor="bible-book" className="sr-only">
              Livro da Bíblia
            </label>
            <Combobox
              options={bookOptions}
              value={selectedBook?.id.toString()}
              onValueChange={(value) => {
                setSelectedBook(
                  books.find((b) => b.id === Number(value)) ?? null
                );
                resetSelections("book");
              }}
              placeholder="Livro"
              searchPlaceholder="Pesquisar livro..."
              emptyPlaceholder="Nenhum livro encontrado."
              disabled={!selectedVersion}
            />
          </div>
          <div className="w-full md:w-1/4">
            <label htmlFor="bible-chapter" className="sr-only">
              Capítulo
            </label>
            <Combobox
              options={chapterOptions}
              value={selectedChapter?.id.toString()}
              onValueChange={(value) => {
                setSelectedChapter(
                  chapters.find((c) => c.id === Number(value)) ?? null
                );
                resetSelections("chapter");
              }}
              placeholder="Capítulo"
              searchPlaceholder="Pesquisar capítulo..."
              emptyPlaceholder="Nenhum capítulo encontrado."
              disabled={!selectedBook}
            />
          </div>
        </div>
      </div>
      <ScrollArea className="border rounded-md p-2 bg-gray-50 h-72 space-y-1">
        {verses.length > 0 ? (
          verses.map((verse) => {
            const isSelected = selectedVerse?.id === verse.id;
            return (
              <div
                key={verse.id}
                ref={isSelected ? activeVerseRef : null}
                onClick={() => setSelectedVerse(verse)}
                className={`p-3 rounded-md cursor-pointer text-base transition-colors ${
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
        size="lg"
      >
        {isBroadcasting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Transmitir Versículo
      </Button>
    </div>
  );
}

// ===================================================================
//   COMPONENTES DO CRONOGRAMA (Sem alterações)
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
      className={`flex items-center justify-between p-2 bg-gray-50 rounded-md transition-shadow ${
        isEditing ? "shadow-lg ring-2 ring-blue-500" : "hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center flex-grow min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab p-2 touch-none flex-shrink-0"
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
            className="h-9 flex-grow"
          />
        ) : (
          <span className="font-medium flex-grow px-2 truncate">
            {item.name}
          </span>
        )}
      </div>
      <div className="flex items-center flex-shrink-0">
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
        <form
          onSubmit={handleAddItem}
          className="flex flex-col sm:flex-row gap-2"
        >
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Ex: Hino de Abertura"
            disabled={isAdding}
            className="flex-grow"
          />
          <Button
            type="submit"
            disabled={!newItemName.trim() || isAdding}
            className="w-full sm:w-auto"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="ml-2">Adicionar</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ===================================================================
//   COMPONENTE DE PEDIDOS DE ORAÇÃO (Sem alterações)
// ===================================================================
function PrayerRequestViewer({ worshipId }: { worshipId: number }) {
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useQuery<PrayerRequest[]>({
    queryKey: ["prayer-requests", worshipId],
    queryFn: () => {
      return worshipService.getPrayerRequests(worshipId);
    },
    select: (data) =>
      [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const handleNewRequest = () => {
      queryClient.invalidateQueries({
        queryKey: ["prayer-requests", worshipId],
      });
    };

    window.addEventListener("prayerRequestReceived", handleNewRequest);

    return () => {
      window.removeEventListener("prayerRequestReceived", handleNewRequest);
    };
  }, [worshipId, queryClient]);

  useEffect(() => {
    if (requests.length > 0 && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [requests.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4">
        Erro ao carregar pedidos: {error.message}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos de Oração</CardTitle>
        <CardDescription>
          Visualize os pedidos de oração enviados em tempo real.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border p-4 bg-gray-50/50">
          <div ref={scrollAreaRef} className="space-y-3">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-white rounded-md shadow-sm animate-in fade-in-0 slide-in-from-top-4 duration-500"
                >
                  <p className="text-sm text-gray-800">{req.request}</p>
                  <p className="text-xs text-right text-gray-400 mt-2">
                    {req.memberName} -{" "}
                    {new Date(req.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
                <HandHeart className="h-12 w-12 mb-4" />
                <p>Nenhum pedido de oração ainda. Aguardando...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ===================================================================
//   COMPONENTE DO PAINEL DE CONTROLE (ATUALIZADO)
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

  // ✅ 2. ESTADO "LEVANTADO" PARA O SELETOR DA BÍBLIA
  const [selectedVersion, setSelectedVersion] = useState<BibleVersion | null>(
    null
  );
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<BibleChapter | null>(
    null
  );
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);

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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-6 lg:px-8 pt-6">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" /> Voltar para a lista
        </Button>
        <CardContent className="text-center mt-2">
          {!isOffering ? (
            <Button
              size="lg"
              onClick={() => presentOfferingMutation()}
              disabled={isPresentingOffering}
              className="bg-green-600 hover:bg-green-700"
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
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mt-4 animate-pulse">
              <Check className="h-5 w-5" />
              <span>Momento da oferta está ativo.</span>
            </div>
          )}
        </CardContent>
      </div>
      <div className="px-2 sm:px-6 lg:px-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">
              {worship.title}
            </CardTitle>
            <CardDescription>
              {worship.theme || "Sem tema definido"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {!isWorshipInProgress ? (
        <div className="space-y-5 px-2 sm:px-3 lg:px-4">
          <ScheduleManager worshipId={worship.id} />
          <div className="text-center py-4">
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
        <div className="px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="cronograma" className="w-full">
            {/* ✅ LAYOUT ATUALIZADO: A largura da coluna do menu foi reduzida. */}
            <div className="md:grid md:grid-cols-[180px_1fr] md:gap-6 lg:grid-cols-[220px_1fr] lg:gap-8">
              <div className="md:border-r md:pr-4">
                <ScrollArea className="whitespace-nowrap md:whitespace-normal">
                  <TabsList className="inline-flex h-auto w-max space-x-2 bg-transparent p-0 md:flex-col md:w-full md:items-start md:space-x-0 md:space-y-1">
                    <TabsTrigger
                      value="cronograma"
                      className="flex-shrink-0 justify-start h-auto gap-3 px-4 py-3 text-base font-medium rounded-md border border-transparent transition-all md:w-full md:flex-shrink md:px-3 md:py-2 md:text-sm md:gap-2"
                    >
                      <ListOrdered className="h-5 w-5 md:h-4 md:w-4" />
                      <span>Cronograma</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="biblia"
                      className="flex-shrink-0 justify-start h-auto gap-3 px-4 py-3 text-base font-medium rounded-md border border-transparent transition-all md:w-full md:flex-shrink md:px-3 md:py-2 md:text-sm md:gap-2"
                    >
                      <BookOpen className="h-5 w-5 md:h-4 md:w-4" />
                      <span>Bíblia</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="hinos"
                      className="flex-shrink-0 justify-start h-auto gap-3 px-4 py-3 text-base font-medium rounded-md border border-transparent transition-all md:w-full md:flex-shrink md:px-3 md:py-2 md:text-sm md:gap-2"
                    >
                      <Music className="h-5 w-5 md:h-4 md:w-4" />
                      <span>Hinos</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="oracoes"
                      className="flex-shrink-0 justify-start h-auto gap-3 px-4 py-3 text-base font-medium rounded-md border border-transparent transition-all md:w-full md:flex-shrink md:px-3 md:py-2 md:text-sm md:gap-2"
                    >
                      <HandHeart className="h-5 w-5 md:h-4 md:w-4" />
                      <span>Orações</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="avisos"
                      className="flex-shrink-0 justify-start h-auto gap-3 px-4 py-3 text-base font-medium rounded-md border border-transparent transition-all md:w-full md:flex-shrink md:px-3 md:py-2 md:text-sm md:gap-2"
                    >
                      <Bell className="h-5 w-5 md:h-4 md:w-4" />
                      <span>Avisos</span>
                    </TabsTrigger>
                  </TabsList>
                  <ScrollBar orientation="horizontal" className="md:hidden" />
                </ScrollArea>
              </div>

              <div className="mt-6 md:mt-0">
                <TabsContent value="cronograma" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Andamento do Culto</CardTitle>
                      <CardDescription>
                        Clique em 'Iniciar' para projetar o item atual.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {worship.schedule
                        ?.sort((a, b) => a.order - b.order)
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md transition-colors gap-2 ${
                              item.id === currentActivityId
                                ? "bg-blue-100 ring-2 ring-blue-300"
                                : "bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <span
                              className={`font-medium truncate ${
                                item.id === currentActivityId
                                  ? "text-blue-700"
                                  : ""
                              }`}
                            >
                              {item.name}
                            </span>
                            <Button
                              size="sm"
                              variant={
                                item.id === currentActivityId
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => setCurrentActivityId(item.id)}
                              className="w-full sm:w-auto flex-shrink-0"
                            >
                              {item.id === currentActivityId ? (
                                <Badge variant="secondary">Projetando</Badge>
                              ) : (
                                <>
                                  <PlayCircle className="h-4 w-4 mr-2" />{" "}
                                  Iniciar
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="biblia" className="mt-0">
                  {/* ✅ 3. PASSANDO O ESTADO E OS SETTERS COMO PROPS */}
                  <BibleSelectorForWorship
                    worshipId={worshipId}
                    selectedVersion={selectedVersion}
                    setSelectedVersion={setSelectedVersion}
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    selectedChapter={selectedChapter}
                    setSelectedChapter={setSelectedChapter}
                    selectedVerse={selectedVerse}
                    setSelectedVerse={setSelectedVerse}
                  />
                </TabsContent>

                <TabsContent value="hinos" className="mt-0">
                  <HymnManager worshipId={worship.id} />
                </TabsContent>

                <TabsContent value="oracoes" className="mt-0">
                  <PrayerRequestViewer worshipId={worshipId} />
                </TabsContent>

                <TabsContent value="avisos" className="mt-0">
                  <AdminNoticeSender worshipId={worship.id} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
}

// ===================================================================
//   COMPONENTE PRINCIPAL DA PÁGINA (Sem alterações)
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
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Carregando cultos...</span>
        </div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Gestão de Culto
        </h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data?.items?.map((worship) => (
          <Card
            key={worship.id}
            className="flex flex-col hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg">{worship.title}</CardTitle>
                <Badge
                  variant={
                    worship.status === WorshipStatus.InProgress
                      ? "default"
                      : worship.status === WorshipStatus.Finished
                      ? "secondary"
                      : "outline"
                  }
                  className="flex-shrink-0"
                >
                  {worship.status === WorshipStatus.InProgress
                    ? "Em Andamento"
                    : worship.status === WorshipStatus.Finished
                    ? "Finalizado"
                    : "Agendado"}
                </Badge>
              </div>
              <CardDescription className="text-sm">
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
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4">
              <Button
                onClick={() => setSelectedWorshipId(worship.id)}
                className="w-full sm:w-auto"
              >
                Gerenciar
              </Button>
              {worship.status === WorshipStatus.InProgress && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isFinishing}
                  onClick={() => finishWorshipMutation(worship.id)}
                  className="w-full sm:w-auto"
                >
                  {isFinishing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Encerrar
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
