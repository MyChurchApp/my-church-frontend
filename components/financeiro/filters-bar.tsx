"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import type { CashFlowCategory } from "@/services/financeiro.service"

interface FiltersBarProps {
  filterType: string
  filterStartDate: string
  filterEndDate: string
  filterCategory: string
  categories: CashFlowCategory[]
  onFilterTypeChange: (value: string) => void
  onFilterStartDateChange: (value: string) => void
  onFilterEndDateChange: (value: string) => void
  onFilterCategoryChange: (value: string) => void
}

export function FiltersBar({
  filterType,
  filterStartDate,
  filterEndDate,
  filterCategory,
  categories = [], // Default para array vazio
  onFilterTypeChange,
  onFilterStartDateChange,
  onFilterEndDateChange,
  onFilterCategoryChange,
}: FiltersBarProps) {
  // Garantir que categories é sempre um array
  const safeCategories = Array.isArray(categories) ? categories : []

  return (
    <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Filter className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
        <Select value={filterType} onValueChange={onFilterTypeChange}>
          <SelectTrigger className="w-28 md:w-40 text-xs md:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="entrada">Entradas</SelectItem>
            <SelectItem value="saida">Saídas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={filterStartDate}
          onChange={(e) => onFilterStartDateChange(e.target.value)}
          placeholder="Data inicial"
          className="w-32 md:w-40 text-xs md:text-sm"
        />
        <span className="text-gray-500 text-xs">até</span>
        <Input
          type="date"
          value={filterEndDate}
          onChange={(e) => onFilterEndDateChange(e.target.value)}
          placeholder="Data final"
          className="w-32 md:w-40 text-xs md:text-sm"
        />
      </div>

      <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
        <SelectTrigger className="w-32 md:w-40 text-xs md:text-sm">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {safeCategories.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
