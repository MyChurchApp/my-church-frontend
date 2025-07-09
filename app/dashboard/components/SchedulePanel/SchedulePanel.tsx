"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  GripVertical,
  Pencil,
  Check,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  worshipService,
  type WorshipScheduleItem,
} from "@/services/worship/worship";

// ✅ Componente interno SEM o botão "onPresent"
function SortableScheduleItem({
  item,
  isReadOnly,
  onRemove,
  onUpdateName,
}: {
  item: WorshipScheduleItem;
  isReadOnly: boolean;
  onRemove: (id: number) => void;
  onUpdateName: (item: WorshipScheduleItem) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id, disabled: isReadOnly });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleSave = () => {
    if (editedName.trim() && editedName !== item.name) {
      onUpdateName({ ...item, name: editedName.trim() });
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (!isEditing) {
      setEditedName(item.name);
    }
  }, [item.name, isEditing]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
        item.isCurrent // ✅ Destaque baseado na prop `isCurrent`
          ? "bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500"
          : "bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50"
      }`}
    >
      <div className="flex items-center gap-2 flex-grow min-w-0">
        {!isReadOnly && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab p-2 touch-none flex-shrink-0 text-gray-400"
          >
            <GripVertical className="h-5 w-5" />
          </button>
        )}
        {isEditing && !isReadOnly ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="h-9"
          />
        ) : (
          <span
            className={`font-medium truncate ${
              item.isCurrent ? "text-blue-800 dark:text-blue-200" : ""
            }`}
          >
            {item.name}
          </span>
        )}
      </div>
      <div className="flex items-center flex-shrink-0">
        {item.isCurrent && isReadOnly && (
          <Badge
            variant="secondary"
            className="bg-blue-600 text-white hover:bg-blue-600"
          >
            Projetando
          </Badge>
        )}
        {!isReadOnly &&
          (isEditing ? (
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
          ))}
      </div>
    </div>
  );
}

export default function SchedulePanel({
  worshipId,
  isReadOnly,
  schedule = [],
}: {
  worshipId: number;
  isReadOnly: boolean;
  schedule?: WorshipScheduleItem[];
}) {
  const [newItemName, setNewItemName] = useState("");
  const [scheduleItems, setScheduleItems] = useState<WorshipScheduleItem[]>([]);

  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    const sortedSchedule = [...schedule].sort((a, b) => a.order - b.order);
    setScheduleItems(sortedSchedule);
  }, [schedule]);

  // ✅ FUNÇÃO DE INVALIDAÇÃO ÚNICA E CORRETA
  const invalidateAndRefetchWorship = () => {
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
      invalidateAndRefetchWorship();
    },
  });

  const { mutate: removeItem } = useMutation({
    mutationFn: (itemId: number) =>
      worshipService.removeScheduleItem(worshipId, itemId),
    onSuccess: invalidateAndRefetchWorship,
  });

  // ✅ LÓGICA DE ATUALIZAÇÃO RESTAURADA: Usa a função original `updateScheduleItem`
  const { mutate: updateItem } = useMutation({
    mutationFn: (item: WorshipScheduleItem) =>
      worshipService.updateScheduleItem(worshipId, item.id, item),
    onSuccess: invalidateAndRefetchWorship,
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      addItem(newItemName.trim());
    }
  };

  // ✅ LÓGICA DE REORDENAR RESTAURADA: Faz um loop e chama a API para cada item
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = scheduleItems.findIndex((item) => item.id === active.id);
      const newIndex = scheduleItems.findIndex((item) => item.id === over.id);
      const newOrderedItems = arrayMove(scheduleItems, oldIndex, newIndex);

      setScheduleItems(newOrderedItems);

      const updatePromises = newOrderedItems.map((item, index) =>
        updateItem({ ...item, order: index })
      );

      Promise.all(updatePromises).then(() => {
        invalidateAndRefetchWorship();
      });
    }
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      {isReadOnly ? (
        <CardHeader className="px-1 pt-1">
          <CardTitle>Andamento do Culto</CardTitle>
          <CardDescription>
            Este é o cronograma atual. Para apresentar, vá para a aba
            correspondente.
          </CardDescription>
        </CardHeader>
      ) : (
        <CardHeader className="px-1 pt-1">
          <CardTitle>Preparar Cronograma</CardTitle>
          <CardDescription>
            Adicione, edite e reordene os itens do culto.
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className="p-0 mt-4">
        <div className="space-y-2">
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
                  isReadOnly={isReadOnly}
                  onRemove={removeItem}
                  onUpdateName={updateItem}
                />
              ))}
            </SortableContext>
          </DndContext>
          {!scheduleItems.length && (
            <div className="text-center text-gray-400 py-10">
              <p>Nenhum item no cronograma.</p>
            </div>
          )}
        </div>
        {!isReadOnly && (
          <form onSubmit={handleAddItem} className="flex gap-2 mt-6">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Ex: Hino de Abertura"
              disabled={isAdding}
              className="flex-grow bg-white dark:bg-gray-900/50"
            />
            <Button type="submit" disabled={!newItemName.trim() || isAdding}>
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Adicionar</span>
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
