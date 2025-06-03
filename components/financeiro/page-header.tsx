"use client"

import { Button } from "@/components/ui/button"
import { MdPictureAsPdf, MdViewList, MdViewModule } from "react-icons/md"

interface PageHeaderProps {
  viewMode: "cards" | "table"
  onViewModeChange: (mode: "cards" | "table") => void
  onGenerateReport: () => void
  onTestAuth?: () => void
  onTestApi?: () => void
  onGetApiDetails?: () => void
}

export function PageHeader({
  viewMode,
  onViewModeChange,
  onGenerateReport,
  onTestAuth,
  onTestApi,
  onGetApiDetails,
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b p-4 flex flex-col md:flex-row justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-gray-500">Gerencie as finanças da sua igreja</p>
      </div>

      <div className="flex items-center space-x-2 mt-4 md:mt-0">
        {onTestAuth && (
          <Button onClick={onTestAuth} variant="outline" size="sm">
            Testar Auth
          </Button>
        )}

        {onTestApi && (
          <Button onClick={onTestApi} variant="outline" size="sm">
            Testar API
          </Button>
        )}

        {onGetApiDetails && (
          <Button onClick={onGetApiDetails} variant="outline" size="sm">
            Ver Detalhes API
          </Button>
        )}

        <Button onClick={onGenerateReport} variant="outline" size="sm">
          <MdPictureAsPdf className="mr-1" />
          Relatório
        </Button>

        <div className="flex border rounded-md">
          <Button
            onClick={() => onViewModeChange("cards")}
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            className="rounded-r-none"
          >
            <MdViewModule />
          </Button>
          <Button
            onClick={() => onViewModeChange("table")}
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="rounded-l-none"
          >
            <MdViewList />
          </Button>
        </div>
      </div>
    </div>
  )
}
