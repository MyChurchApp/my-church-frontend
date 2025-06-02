"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, RotateCcw, LogOut } from "lucide-react"

interface ApiErrorCardProps {
  error: string
  isUnauthorized?: boolean
  onRetry: () => void
  onRefresh: () => void
  onLogout?: () => void
}

export function ApiErrorCard({ error, isUnauthorized, onRetry, onRefresh, onLogout }: ApiErrorCardProps) {
  return (
    <Card className={`border-red-200 ${isUnauthorized ? "bg-orange-50" : "bg-red-50"}`}>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className={`h-12 w-12 ${isUnauthorized ? "text-orange-500" : "text-red-500"}`} />
          <div>
            <h3 className={`text-lg font-semibold ${isUnauthorized ? "text-orange-800" : "text-red-800"}`}>
              {isUnauthorized ? "Sessão Expirada" : "Erro na API"}
            </h3>
            <p className={`${isUnauthorized ? "text-orange-600" : "text-red-600"} mt-2`}>{error}</p>
          </div>
          <div className="flex space-x-3">
            {isUnauthorized ? (
              <>
                <Button
                  variant="outline"
                  onClick={onRefresh}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Página
                </Button>
                {onLogout && (
                  <Button onClick={onLogout} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <LogOut className="h-4 w-4 mr-2" />
                    Fazer Login
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onRetry} className="border-red-300 text-red-700 hover:bg-red-100">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button onClick={onRefresh} className="bg-red-600 hover:bg-red-700 text-white">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Atualizar Página
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
