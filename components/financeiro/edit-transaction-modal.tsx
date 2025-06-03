"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { CashFlowItem, CashFlowCategory } from "@/services/financeiro.service"

interface EditTransactionModalProps {
  transaction: CashFlowItem | null
  categories: CashFlowCategory[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    type: string
    categoryId: string
    description: string
    amount: string
    date: string
  }) => void
}

export function EditTransactionModal({
  transaction,
  categories,
  isOpen,
  onOpenChange,
  onSubmit,
}: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    type: "",
    categoryId: "",
    description: "",
    amount: "",
    date: "",
  })

  // ✅ Preencher formulário quando a transação mudar
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type === 0 ? "entrada" : "saida",
        categoryId: transaction.categoryId.toString(),
        description: transaction.description,
        amount: transaction.amount.toString(),
        date: new Date(transaction.date).toISOString().split("T")[0], // Formato YYYY-MM-DD
      })
    }
  }, [transaction])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!formData.type || !formData.categoryId || !formData.description || !formData.amount || !formData.date) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (Number.parseFloat(formData.amount) <= 0) {
      alert("O valor deve ser maior que zero.")
      return
    }

    onSubmit(formData)
  }

  const resetForm = () => {
    setFormData({
      type: "",
      categoryId: "",
      description: "",
      amount: "",
      date: "",
    })
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Edite os dados da transação #{transaction.id}. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">💰 Entrada</SelectItem>
                  <SelectItem value="saida">💸 Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição *</Label>
            <Textarea
              id="edit-description"
              placeholder="Descreva a transação..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Valor (R$) *</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Data *</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
