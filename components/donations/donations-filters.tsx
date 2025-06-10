"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X, Filter } from "lucide-react"
import type { DonationsFilters } from "@/services/donations.service"

interface DonationsFiltersProps {
  onFiltersChange: (filters: DonationsFilters) => void
  isLoading?: boolean
}

export function DonationsFiltersComponent({ onFiltersChange, isLoading }: DonationsFiltersProps) {
  const [filters, setFilters] = useState<DonationsFilters>({
    page: 1,
    pageSize: 10,
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: keyof DonationsFilters, value: string | number) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: 1, // Reset page when filtering
    }
    setFilters(newFilters)
  }

  const handleSearch = () => {
    onFiltersChange(filters)
  }

  const handleClear = () => {
    const clearedFilters = { page: 1, pageSize: 10 }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = filters.description || filters.value || filters.date

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Ocultar" : "Mostrar"}
          </Button>
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Buscar por descrição..."
                value={filters.description || ""}
                onChange={(e) => handleFilterChange("description", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={filters.value || ""}
                onChange={(e) => handleFilterChange("value", Number.parseFloat(e.target.value) || "")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={filters.date || ""}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSearch} disabled={isLoading} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </Button>

            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClear} disabled={isLoading} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="text-sm text-muted-foreground">
              Filtros ativos:{" "}
              {[
                filters.description && `Descrição: "${filters.description}"`,
                filters.value && `Valor: R$ ${filters.value}`,
                filters.date && `Data: ${new Date(filters.date).toLocaleDateString("pt-BR")}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
