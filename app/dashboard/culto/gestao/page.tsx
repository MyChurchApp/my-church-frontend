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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import {
  worshipService,
  type WorshipService,
  WorshipStatus,
  type WorshipScheduleItem,
} from "@/services/worship/worship";
import {
  bibleService,
  type BibleBook,
  type BibleChapter,
} from "@/services/biblia/biblia";
import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";

// Mock de Hinos
const HARPA_HYMNS: Record<string, string> = {
  "15": "Vem...",
  "526": "Porque Ele vive...",
};

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
            className="h-9"
          />
        ) : (
          <span className="font-medium flex-grow px-2">{item.name}</span>
        )}
      </div>
      <div className="flex items-center">
        {isEditing ? (
          <>
            <Button variant="ghost" size="icon" onClick={handleSave}>
              <Check className="h-5 w-5 text-green-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-5 w-5 text-red-600" />
            </Button>
          </>
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
    if (worship?.schedule) {
      setScheduleItems(
        worship.schedule.sort((a, b) => a.order - b.order) || []
      );
    }
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
    onError: (err) => alert(`Erro ao iniciar culto: ${err.message}`),
  });

  const [bibleSelection, setBibleSelection] = useState({
    bookId: null,
    chapterId: null,
    verseStart: null,
    verseEnd: null,
  });
  const [hymnSelection, setHymnSelection] = useState({
    type: "custom",
    harpaNumber: "",
    customText: "",
  });
  const [announcement, setAnnouncement] = useState("");

  const { data: books = [] } = useQuery({
    queryKey: ["bible-books", 1],
    queryFn: () => bibleService.getBooksByVersion(1),
  });
  const { data: chapters = [] } = useQuery({
    queryKey: ["bible-chapters", bibleSelection.bookId],
    queryFn: () =>
      bibleSelection.bookId
        ? bibleService.getChaptersByBookId(bibleSelection.bookId)
        : [],
    enabled: !!bibleSelection.bookId,
  });
  const { data: verses = [] } = useQuery({
    queryKey: ["bible-verses", bibleSelection.chapterId],
    queryFn: () =>
      bibleSelection.chapterId
        ? bibleService.getVersesByChapterId(bibleSelection.chapterId)
        : [],
    enabled: !!bibleSelection.chapterId,
  });

  const handleBroadcastBible = () => {
    /* ... */
  };
  const handleBroadcastHymn = () => {
    /* ... */
  };
  const handleBroadcastAnnouncement = () => {
    /* ... */
  };
  const openProjector = () =>
    window.open(
      `/dashboard/culto/projetor?worshipId=${worshipId}`,
      "_blank",
      "noopener,noreferrer"
    );

  if (isLoading || !worship)
    return (
      <div className="p-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
        <Button onClick={openProjector}>
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

          {/* Aba do Cronograma ao Vivo */}
          <TabsContent value="cronograma">
            <Card>
              <CardHeader>
                <CardTitle>Andamento do Culto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {worship.schedule
                  ?.sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const isCurrent = item.id === currentActivityId;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                          isCurrent ? "bg-blue-100" : "bg-gray-50"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            isCurrent ? "text-blue-700" : ""
                          }`}
                        >
                          {item.name}
                        </span>
                        <Button
                          size="sm"
                          variant={isCurrent ? "default" : "outline"}
                          onClick={() => setCurrentActivityId(item.id)}
                        >
                          {isCurrent ? (
                            <Badge>Em andamento</Badge>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" /> Iniciar
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="biblia">{/* ... */}</TabsContent>
          <TabsContent value="hinos">{/* ... */}</TabsContent>
          <TabsContent value="avisos">{/* ... */}</TabsContent>
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
      onError: (err) => alert(`Erro ao finalizar o culto: ${err.message}`),
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

  if (selectedWorshipId) {
    return (
      <WorshipControlPanel
        worshipId={selectedWorshipId}
        onBack={() => setSelectedWorshipId(null)}
      />
    );
  }

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
