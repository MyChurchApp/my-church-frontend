"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  return (
    <Card>
      <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
          {Math.min(currentPage * pageSize, totalCount)} de {totalCount} ativos
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Próxima
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
