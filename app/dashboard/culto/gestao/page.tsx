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
  Mic,
  ChevronLeft,
  MonitorPlay,
  Plus,
  Trash2,
  GripVertical,
  Pencil,
  Check,
  X,
  PlayCircle,
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

import {
  worshipService,
  type WorshipService,
  WorshipStatus,
  type WorshipScheduleItem,
} from "@/services/worship/worship";
import {
  bibleService,
  type BibleVersion,
  type BibleBook,
  type BibleChapter,
  type BibleVerse,
} from "@/services/biblia/biblia";
import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";

// Mock de Hinos
const HARPA_HYMNS: Record<string, string> = {
  "15": "Vem...",
  "526": "Porque Ele vive...",
};

// ===================================================================
//   COMPONENTES ANINHADOS
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

  const { data: versions = [] } = useQuery<BibleVersion[]>({
    queryKey: ["bible-versions"],
    queryFn: () => bibleService.getVersions(),
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
    onSuccess: () => console.log("Comando para destacar versículo enviado!"),
    onError: (err) => alert(`Erro ao transmitir: ${err.message}`),
  });

  const handleBroadcast = () => {
    if (!selectedVersion || !selectedBook || !selectedChapter || !selectedVerse)
      return alert(
        "Selecione Versão, Livro, Capítulo e um Versículo da lista."
      );
    highlightVerse({
      versionId: selectedVersion.id,
      bookId: selectedBook.id,
      chapterId: selectedChapter.id,
      verseId: selectedVerse.id,
    });
  };

  const resetSelections = (level: "version" | "book" | "chapter") => {
    if (level === "version") setSelectedBook(null);
    if (level === "version" || level === "book") setSelectedChapter(null);
    setSelectedVerse(null);
  };

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

      {/* ############################################################### */}
      {/* ##               VISUALIZADOR DE VERSÍCULOS                  ## */}
      {/* ############################################################### */}
      <div className="border rounded-md p-2 bg-gray-50 h-64 overflow-y-auto space-y-1">
        {verses.length > 0 ? (
          verses.map((verse) => (
            <div
              key={verse.id}
              onClick={() => setSelectedVerse(verse)}
              className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${
                selectedVerse?.id === verse.id
                  ? "bg-blue-100 text-blue-800 ring-2 ring-blue-300"
                  : "hover:bg-gray-200"
              }`}
            >
              <sup className="font-bold mr-2">{verse.verseNumber}</sup>
              {verse.text}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Selecione Livro e Capítulo para ver os versículos.</p>
          </div>
        )}
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

  const invalidateAndRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ["worship-service", worshipId] });
  };

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
    onError: (err) => alert(`Erro: ${err.message}`),
  });
  const { mutate: removeItem } = useMutation({
    mutationFn: (itemId: number) =>
      worshipService.removeScheduleItem(worshipId, itemId),
    onSuccess: () => invalidateAndRefetch(),
    onError: (err) => alert(`Erro: ${err.message}`),
  });
  const { mutate: updateItem } = useMutation({
    mutationFn: (item: WorshipScheduleItem) =>
      worshipService.updateScheduleItem(worshipId, item.id, item),
    onSuccess: () => invalidateAndRefetch(),
    onError: (err) => alert(`Erro: ${err.message}`),
  });

  const handleUpdateName = (itemId: number, newName: string) => {
    const itemToUpdate = scheduleItems.find((item) => item.id === itemId);
    if (itemToUpdate) updateItem({ ...itemToUpdate, name: newName });
  };
  const handleAddItem = (e: React.FormEvent) => {
    if (newItemName.trim()) addItem(newItemName.trim());
    e.preventDefault();
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
          <Button type="submit" disabled={isAdding}>
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

function WorshipControlPanel({
  worshipId,
  onBack,
}: {
  worshipId: number;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const { broadcastMessage } = useSignalRForWorship(worshipId);
  const [currentActivityId, setCurrentActivityId] = useState<number | null>(
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
  const { mutate: startWorshipMutation, isPending: isStarting } = useMutation({
    mutationFn: () => worshipService.startWorship(worshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["worship-service", worshipId],
      });
      queryClient.invalidateQueries({ queryKey: ["worship-services-list"] });
    },
    onError: (err) => alert(`Erro: ${err.message}`),
  });

  if (isLoading || !worship)
    return (
      <div className="p-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Erro ao carregar dados.
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="biblia">Bíblia</TabsTrigger>
            <TabsTrigger value="hinos">Hinos</TabsTrigger>
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
          <TabsContent value="hinos">{/* Hinos */}</TabsContent>
          <TabsContent value="avisos">{/* Avisos */}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}

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
      onError: (err) => alert(`Erro: ${err.message}`),
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
                  {worship.status === 0
                    ? "Não Iniciado"
                    : worship.status === 1
                    ? "Em Andamento"
                    : "Finalizado"}
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
