"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { CashFlowCategory } from "@/services/financeiro.service";

interface Category {
  id: number;
  name: string;
  description: string;
}

interface CategoriesModalProps {
  categories: CashFlowCategory[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCategory: (data: {
    name: string;
    description: string;
  }) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
  onEditCategory?: (category: CashFlowCategory) => Promise<void>;
}

export function CategoriesModal({
  categories,
  isOpen,
  onOpenChange,
  onCreateCategory,
  onDeleteCategory,
}: CategoriesModalProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    try {
      setLoading(true);
      await onCreateCategory({ name, description: "" });
      toast({ title: "✅ Categoria adicionada com sucesso!" });
      setNewCategoryName("");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "❌ Erro ao adicionar categoria",
        description: err instanceof Error ? err.message : "Erro desconhecido.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (category: Category) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a categoria "${category.name}"?\nEssa ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    try {
      await onDeleteCategory(category.id);
      toast({ title: "✅ Categoria excluída com sucesso!" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "❌ Erro ao excluir categoria",
        description: err instanceof Error ? err.message : "Erro desconhecido.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Adicione ou remova categorias para organizar suas finanças.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nova Categoria
            </Label>
            <Input
              id="name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <Button
            onClick={handleAddCategory}
            variant="outline"
            disabled={loading}
          >
            {loading ? "Adicionando..." : "Adicionar Categoria"}
          </Button>
        </div>
        <Table>
          <TableCaption>Suas categorias atuais.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => handleDeleteClick(category)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    🗑️ Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
