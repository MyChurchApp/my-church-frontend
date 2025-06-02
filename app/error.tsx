"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { isAuthenticated, redirectToDashboard, redirectToHome } = useAuth()

  useEffect(() => {
    // Log do erro para debugging
    console.error("Erro na aplicação:", error)
  }, [error])

  const handleGoBack = () => {
    if (isAuthenticated) {
      redirectToDashboard()
    } else {
      redirectToHome()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ops! Algo deu errado</h1>

          <p className="text-gray-600 mb-6">
            Ocorreu um erro inesperado. Você pode tentar novamente ou voltar para uma página segura.
          </p>

          <div className="space-y-3">
            <Button onClick={reset} className="w-full" variant="default">
              Tentar Novamente
            </Button>

            <Button onClick={handleGoBack} className="w-full" variant="outline">
              {isAuthenticated ? (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </>
              ) : (
                <>
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Home
                </>
              )}
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Detalhes do erro (desenvolvimento)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">{error.message}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
