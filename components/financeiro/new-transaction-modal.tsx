"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CashFlowCategory } from "@/services/financeiro.service"

interface NewTransactionModalProps {
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

export function NewTransactionModal({
  categories = [], // Default para array vazio
  isOpen,
  onOpenChange,
  onSubmit,
}: NewTransactionModalProps) {
  const [formData, setFormData] = useState({
    type: "",
    categoryId: "",
    description: "",
    amount: "",
    date: "",
  })

  // Garantir que categories é sempre um array
  const safeCategories = Array.isArray(categories) ? categories : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.type || !formData.categoryId || !formData.description || !formData.amount || !formData.date) {
      return
    }
    onSubmit(formData)
    setFormData({ type: "", categoryId: "", description: "", amount: "", date: "" })
  }

  const getAvailableCategories = (type: string) => {
    // Como não temos o campo type nas categorias da API, vamos mostrar todas
    return safeCategories
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value, categoryId: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction-category">Categoria</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              disabled={!formData.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableCategories(formData.type).map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction-description">Descrição</Label>
            <Input
              id="transaction-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da transação"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-amount">Valor</Label>
              <Input
                id="transaction-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-date">Data</Label>
              <Input
                id="transaction-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Registrar Transação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
