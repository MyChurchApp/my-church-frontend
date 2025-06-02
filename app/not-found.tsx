"use client"

import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function NotFound() {
  const { isAuthenticated, redirectToDashboard, redirectToHome } = useAuth()

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
            <div className="bg-blue-100 rounded-full p-3">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Página não encontrada</h2>

          <p className="text-gray-600 mb-6">A página que você está procurando não existe ou foi movida.</p>

          <div className="space-y-3">
            <Button onClick={handleGoBack} className="w-full" variant="default">
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

            {isAuthenticated && (
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
