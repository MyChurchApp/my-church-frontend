"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, CheckCircle, Clock } from "lucide-react";
import { formatCurrency, type Asset } from "@/services/ativos/assets.service";

interface StatsCardsProps {
  assets: Asset[];
}

export const StatsCards = ({ assets }: StatsCardsProps) => {
  // Calcula as estatísticas com base nos ativos recebidos
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  const goodConditionCount = assets.filter(
    (a) =>
      a.condition.toLowerCase() === "excelente" ||
      a.condition.toLowerCase() === "bom"
  ).length;

  const inMaintenanceCount = assets.filter(
    (a) =>
      a.condition.toLowerCase() === "em manutenção" ||
      a.condition.toLowerCase() === "regular"
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total de Ativos
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {assets.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Em Bom Estado</p>
              <p className="text-2xl font-bold text-gray-900">
                {goodConditionCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Manutenção</p>
              <p className="text-2xl font-bold text-gray-900">
                {inMaintenanceCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
