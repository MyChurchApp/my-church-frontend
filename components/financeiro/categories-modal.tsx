"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CashFlowCategory } from "@/lib/types"
import { useState } from "react"

interface CategoriesModalProps {
  categories: CashFlowCategory[]
  onAddCategory: (name: string) => void
  onDeleteCategory: (id: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriesModal({
  categories,
  onAddCategory,
  onDeleteCategory,
  isOpen,
  onOpenChange,
}: CategoriesModalProps) {
  const [newCategoryName, setNewCategoryName] = useState("")

  const handleAddCategory = () => {
    if (newCategoryName.trim() !== "") {
      onAddCategory(newCategoryName)
      setNewCategoryName("")
    }
  }

  const handleDeleteClick = (category: CashFlowCategory) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a categoria "${category.name}"?\n\n` + `Esta ação não pode ser desfeita.`,
    )

    if (confirmDelete) {
      onDeleteCategory(category.id)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>Adicione ou remova categorias para organizar suas finanças.</DialogDescription>
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
          <Button onClick={handleAddCategory} variant="outline">
            Adicionar Categoria
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
  )
}
