"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  MapPin,
  User,
  CheckCircle,
  Clock,
  Package,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getConditionColor,
  assetTypeOptions,
  deleteAsset,
  type Asset,
} from "@/services/ativos/assets.service";

interface AssetsDisplayProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: () => void;
}

export const AssetsDisplay = ({
  assets,
  onEdit,
  onDelete,
}: AssetsDisplayProps) => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards"); // Este estado pode ser elevado se necessário

  const categoryLabels = assetTypeOptions.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {} as Record<number, string>);

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este ativo?")) {
      try {
        await deleteAsset(id);
        onDelete();
      } catch (error) {
        console.error("Erro ao excluir ativo:", error);
      }
    }
  };

  if (viewMode === "cards") {
    return (
      <div className="grid gap-4 md:gap-6">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
              {asset.photo && (
                <img
                  src={asset.photo}
                  alt={asset.name}
                  className="w-full md:w-48 h-32 md:h-24 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{asset.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {asset.description}
                </p>
                {/* Outros detalhes aqui... */}
              </div>
              <div className="flex gap-2 self-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(asset)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(asset.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-medium">Nome</th>
                <th className="p-4 text-left font-medium">Categoria</th>
                <th className="p-4 text-left font-medium">Condição</th>
                <th className="p-4 text-left font-medium">Valor</th>
                <th className="p-4 text-left font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr
                  key={asset.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-4 font-medium">{asset.name}</td>
                  <td className="p-4">
                    <Badge variant="outline">
                      {categoryLabels[asset.type]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={getConditionColor(asset.condition)}>
                      {asset.condition}
                    </Badge>
                  </td>
                  <td className="p-4">{formatCurrency(asset.value)}</td>
                  <td className="p-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(asset)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(asset.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
