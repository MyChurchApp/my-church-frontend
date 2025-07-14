"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Grid3X3, List } from "lucide-react";
import {
  assetTypeOptions,
  assetConditions,
} from "@/services/ativos/assets.service";

interface FilterBarProps {
  onFiltersChange: (filters: {
    name: string;
    type: string;
    condition: string;
  }) => void;
  initialFilters: { name: string; type: string; condition: string };
}

export const FilterBar = ({
  onFiltersChange,
  initialFilters,
}: FilterBarProps) => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const handleFilterChange = (field: string, value: string) => {
    onFiltersChange({ ...initialFilters, [field]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ name: "", type: "all", condition: "all" });
  };

  const categoryLabels = assetTypeOptions.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {} as Record<number, string>);

  const conditionLabels = assetConditions.reduce((acc, condition) => {
    acc[condition.toLowerCase()] = condition;
    return acc;
  }, {} as Record<string, string>);

  return (
    <Card>
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar ativos..."
              value={initialFilters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={initialFilters.type}
            onValueChange={(v) => handleFilterChange("type", v)}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={initialFilters.condition}
            onValueChange={(v) => handleFilterChange("condition", v)}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Condição" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Condições</SelectItem>
              {Object.entries(conditionLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full md:w-auto"
          >
            Limpar
          </Button>
        </div>

        <div className="flex justify-end">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4 mr-1" />
              Tabela
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
