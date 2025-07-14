"use client";

import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface HeaderActionsProps {
  onNewAsset: () => void;
  onExport: () => void;
}

export const HeaderActions = ({ onNewAsset, onExport }: HeaderActionsProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-800">Patrimônio da Igreja</h1>
      <div className="flex gap-2">
        <Button onClick={onExport} variant="outline" className="hidden md:flex">
          <FileText className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
        <Button onClick={onExport} variant="outline" className="md:hidden">
          <FileText className="h-4 w-4" />
        </Button>
        <Button
          onClick={onNewAsset}
          style={{ backgroundColor: "#89f0e6" }}
          className="text-gray-800 hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Novo Ativo</span>
          <span className="md:hidden">Novo</span>
        </Button>
      </div>
    </div>
  );
};
