"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { CashFlowCategory } from "@/services/financeiro.service"

interface CategoriesModalProps {
  categories: CashFlowCategory[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateCategory: (data: { name: string; description: string }) => void
}

export function CategoriesModal({
  categories = [], // Default para array vazio
  isOpen,
  onOpenChange,
  onCreateCategory,
}: CategoriesModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [formError, setFormError] = useState<string | null>(null)

  // Garantir que categories é sempre um array
  const safeCategories = Array.isArray(categories) ? categories : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validação
    if (!formData.name.trim()) {
      setFormError("Nome da categoria é obrigatório")
      return
    }

    // Remover o campo type já que a API não espera
    onCreateCategory({
      name: formData.name,
      description: formData.description,
    })

    setFormData({ name: "", description: "" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="add">Adicionar</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="space-y-2 max-h-60 overflow-y-auto">
            {safeCategories.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma categoria encontrada</p>
            ) : (
              safeCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                  <Badge variant="outline">{category.churchName || "Sistema"}</Badge>
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="add">
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category-name">Nome da Categoria*</Label>
                <Input
                  id="category-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Manutenção"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-description">Descrição (opcional)</Label>
                <Input
                  id="category-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da categoria"
                />
              </div>

              <Button type="submit" className="w-full">
                Criar Categoria
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
